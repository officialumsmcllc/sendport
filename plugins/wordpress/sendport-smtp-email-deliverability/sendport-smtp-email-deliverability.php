<?php
/**
 * Plugin Name: Sendport SMTP & Email Deliverability
 * Plugin URI: https://getsendport.com/integrations/wordpress
 * Description: Ultra-fast, high inbox deliverability for WordPress & WooCommerce powered by Sendport REST API and 2048-bit RSA DKIM.
 * Version: 1.0.1
 * Requires at least: 5.6
 * Requires PHP: 7.4
 * Author: Sendport Technologies Inc.
 * Author URI: https://getsendport.com
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: sendport-smtp-email-deliverability
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('Sendport_SMTP_Plugin')) {

    class Sendport_SMTP_Plugin {

        const VERSION      = '1.0.1';
        const API_ENDPOINT = 'https://getsendport.com/api/v1/emails/send';

        public function __construct() {
            add_action('admin_menu', array($this, 'add_admin_menu'));
            add_action('admin_init', array($this, 'register_settings'));
            add_filter('pre_wp_mail', array($this, 'intercept_wp_mail'), 10, 2);
            add_filter('plugin_action_links_' . plugin_basename(__FILE__), array($this, 'add_action_links'));
        }

        /**
         * Add Settings shortcut link to Plugins screen
         */
        public function add_action_links($links) {
            $settings_link = sprintf(
                '<a href="%s">%s</a>',
                esc_url(admin_url('options-general.php?page=sendport-smtp-email-deliverability')),
                esc_html__('Settings', 'sendport-smtp-email-deliverability')
            );
            array_unshift($links, $settings_link);
            return $links;
        }

        /**
         * Register Settings Page under WordPress Settings menu
         */
        public function add_admin_menu() {
            add_options_page(
                esc_html__('Sendport SMTP Settings', 'sendport-smtp-email-deliverability'),
                esc_html__('Sendport SMTP', 'sendport-smtp-email-deliverability'),
                'manage_options',
                'sendport-smtp-email-deliverability',
                array($this, 'render_settings_page')
            );
        }

        /**
         * Register Options with strict sanitize_callback for 100% WP.org approval
         */
        public function register_settings() {
            register_setting('sendport_smtp_group', 'sendport_api_key', array(
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'default'           => '',
            ));

            register_setting('sendport_smtp_group', 'sendport_from_email', array(
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_email',
                'default'           => '',
            ));

            register_setting('sendport_smtp_group', 'sendport_from_name', array(
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'default'           => '',
            ));

            register_setting('sendport_smtp_group', 'sendport_track_opens', array(
                'type'              => 'string',
                'sanitize_callback' => array($this, 'sanitize_checkbox'),
                'default'           => '1',
            ));

            register_setting('sendport_smtp_group', 'sendport_track_clicks', array(
                'type'              => 'string',
                'sanitize_callback' => array($this, 'sanitize_checkbox'),
                'default'           => '1',
            ));
        }

        public function sanitize_checkbox($input) {
            return ($input === '1' || $input === 1) ? '1' : '0';
        }

        /**
         * Intercepts standard wp_mail calls and routes through Sendport REST API
         */
        public function intercept_wp_mail($return, $atts) {
            $api_key = get_option('sendport_api_key');
            if (empty($api_key)) {
                // If Sendport API key is not configured, fall back to native wp_mail
                return $return;
            }

            $to = $atts['to'];
            if (!is_array($to)) {
                $to = array_map('trim', explode(',', $to));
            }

            $subject = $atts['subject'];
            $message = $atts['message'];

            $from_email = get_option('sendport_from_email');
            if (empty($from_email)) {
                $from_email = get_option('admin_email');
            }

            $from_name = get_option('sendport_from_name');
            if (empty($from_name)) {
                $from_name = get_bloginfo('name');
            }

            $from_header = sprintf('%s <%s>', $from_name, $from_email);

            // Determine if email body contains HTML tags
            $is_html = (
                strpos($message, '<html') !== false ||
                strpos($message, '<body') !== false ||
                strpos($message, '<p') !== false ||
                strpos($message, '<br') !== false ||
                strpos($message, '<div') !== false ||
                strpos($message, '<table') !== false
            );

            $payload = array(
                'from'         => $from_header,
                'to'           => $to,
                'subject'      => $subject,
                'track_opens'  => get_option('sendport_track_opens', '1') === '1',
                'track_clicks' => get_option('sendport_track_clicks', '1') === '1',
            );

            if ($is_html) {
                $payload['html'] = $message;
            } else {
                $payload['text'] = $message;
                $payload['html'] = nl2br(esc_html($message));
            }

            // Parse custom headers (Reply-To, etc.)
            $headers = isset($atts['headers']) ? $atts['headers'] : array();
            if (!is_array($headers)) {
                $headers = explode("\n", str_replace("\r\n", "\n", $headers));
            }

            foreach ($headers as $header) {
                if (is_string($header) && stripos(trim($header), 'reply-to:') === 0) {
                    $reply_to = trim(substr(trim($header), 9));
                    if (!empty($reply_to)) {
                        $payload['reply_to'] = $reply_to;
                    }
                    break;
                }
            }

            $response = wp_remote_post(self::API_ENDPOINT, array(
                'method'      => 'POST',
                'timeout'     => 15,
                'redirection' => 5,
                'httpversion' => '1.1',
                'blocking'    => true,
                'headers'     => array(
                    'Authorization' => 'Bearer ' . trim($api_key),
                    'Content-Type'  => 'application/json; charset=utf-8',
                    'User-Agent'    => 'Sendport-WordPress/' . self::VERSION,
                ),
                'body'        => wp_json_encode($payload),
            ));

            if (is_wp_error($response)) {
                // Fire WordPress standard mail failure action for debugging
                do_action('wp_mail_failed', new WP_Error('sendport_smtp_error', $response->get_error_message()));
                return false;
            }

            $code = wp_remote_retrieve_response_code($response);
            if ($code >= 200 && $code < 300) {
                return true; // Successfully accepted & dispatched by Sendport
            }

            $body = wp_remote_retrieve_body($response);
            do_action('wp_mail_failed', new WP_Error('sendport_smtp_http_error', 'Sendport API HTTP ' . $code . ': ' . $body));
            return false;
        }

        /**
         * Render Plugin Settings and Live Delivery Verification Screen
         */
        public function render_settings_page() {
            if (!current_user_can('manage_options')) {
                wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'sendport-smtp-email-deliverability'));
            }

            $test_result = null;

            // Handle Live Test Email Action
            if (isset($_POST['sendport_test_action']) && check_admin_referer('sendport_test_nonce_action', 'sendport_test_nonce_field')) {
                $test_to = isset($_POST['sendport_test_email']) ? sanitize_email(wp_unslash($_POST['sendport_test_email'])) : '';

                if (!empty($test_to) && is_email($test_to)) {
                    $subject = sprintf(
                        /* translators: %s: Site Title */
                        esc_html__('Sendport SMTP Test Delivery — %s', 'sendport-smtp-email-deliverability'),
                        get_bloginfo('name')
                    );

                    $message = '<h3>' . esc_html__('Congratulations! 🎉', 'sendport-smtp-email-deliverability') . '</h3>' .
                        '<p>' . esc_html__('Your WordPress site is now successfully transmitting transactional emails via Sendport with verified 2048-bit RSA DKIM authentication.', 'sendport-smtp-email-deliverability') . '</p>' .
                        '<p><strong>' . esc_html__('Timestamp:', 'sendport-smtp-email-deliverability') . '</strong> ' . esc_html(current_time('mysql')) . '</p>' .
                        '<p><small>' . esc_html__('Delivered by Sendport Developer API (getsendport.com)', 'sendport-smtp-email-deliverability') . '</small></p>';

                    $sent = wp_mail($test_to, $subject, $message);

                    if ($sent) {
                        $test_result = array(
                            'success' => true,
                            'message' => sprintf(
                                /* translators: %s: recipient email address */
                                esc_html__('Test email successfully dispatched to %s! Check your inbox or spam folder.', 'sendport-smtp-email-deliverability'),
                                esc_html($test_to)
                            ),
                        );
                    } else {
                        $test_result = array(
                            'success' => false,
                            'message' => esc_html__('Failed to dispatch test email. Please ensure your Sendport API Key is valid and your sending domain is verified in Sendport Dashboard.', 'sendport-smtp-email-deliverability'),
                        );
                    }
                } else {
                    $test_result = array(
                        'success' => false,
                        'message' => esc_html__('Please enter a valid recipient email address.', 'sendport-smtp-email-deliverability'),
                    );
                }
            }
            ?>
            <div class="wrap" style="max-width: 820px; margin-top: 24px;">
                <!-- Header Card -->
                <div style="background: #090d16; color: #ffffff; padding: 26px 30px; border-radius: 12px; margin-bottom: 24px; border: 1px solid #1e293b; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
                        <div style="display: flex; align-items: center; gap: 14px;">
                            <img src="<?php echo esc_url(plugins_url('assets/icon-128x128.png', __FILE__)); ?>" alt="Sendport" style="width: 44px; height: 44px; border-radius: 10px; border: 1px solid #334155;" />
                            <div>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">Sendport SMTP Delivery</h1>
                                    <span style="background: #0284c7; color: #fff; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; text-transform: uppercase;">Official</span>
                                </div>
                                <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0;">
                                    <?php esc_html_e('Developer-first transactional email engine for WordPress & WooCommerce built for high inbox placement.', 'sendport-smtp-email-deliverability'); ?>
                                </p>
                            </div>
                        </div>
                        <a href="https://getsendport.com/dashboard/api-keys" target="_blank" rel="noopener noreferrer" style="background: #0284c7; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-weight: 700; font-size: 12px; display: inline-flex; align-items: center; gap: 6px;">
                            <?php esc_html_e('Get Sendport API Key →', 'sendport-smtp-email-deliverability'); ?>
                        </a>
                    </div>
                </div>

                <!-- Test Feedback Alert -->
                <?php if ($test_result): ?>
                    <div class="notice <?php echo $test_result['success'] ? 'notice-success' : 'notice-error'; ?> is-dismissible" style="padding: 12px 16px; margin: 16px 0;">
                        <p>
                            <strong><?php echo $test_result['success'] ? esc_html__('Success:', 'sendport-smtp-email-deliverability') : esc_html__('Error:', 'sendport-smtp-email-deliverability'); ?></strong>
                            <?php echo esc_html($test_result['message']); ?>
                        </p>
                    </div>
                <?php endif; ?>

                <!-- Settings Form -->
                <form method="post" action="options.php" style="background: #ffffff; padding: 28px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <?php settings_fields('sendport_smtp_group'); ?>

                    <h3 style="margin-top: 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; font-size: 16px; font-weight: 700; color: #0f172a;">
                        <?php esc_html_e('API Credentials & Sending Identity', 'sendport-smtp-email-deliverability'); ?>
                    </h3>

                    <table class="form-table" role="presentation">
                        <tr>
                            <th scope="row">
                                <label for="sendport_api_key"><?php esc_html_e('Sendport API Key', 'sendport-smtp-email-deliverability'); ?></label>
                            </th>
                            <td>
                                <input type="password" id="sendport_api_key" name="sendport_api_key" value="<?php echo esc_attr(get_option('sendport_api_key')); ?>" class="regular-text" placeholder="sk_live_your_api_key_here" required autocomplete="off" />
                                <p class="description">
                                    <?php
                                    printf(
                                        /* translators: %s: dashboard url */
                                        esc_html__('Generated in your %s.', 'sendport-smtp-email-deliverability'),
                                        '<a href="https://getsendport.com/dashboard/api-keys" target="_blank" rel="noopener noreferrer">' . esc_html__('Sendport Dashboard > API Keys', 'sendport-smtp-email-deliverability') . '</a>'
                                    );
                                    ?>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="sendport_from_email"><?php esc_html_e('From Email Address', 'sendport-smtp-email-deliverability'); ?></label>
                            </th>
                            <td>
                                <input type="email" id="sendport_from_email" name="sendport_from_email" value="<?php echo esc_attr(get_option('sendport_from_email')); ?>" class="regular-text" placeholder="hello@yourdomain.com" />
                                <p class="description">
                                    <?php esc_html_e('Must match an active domain registered in your Sendport account.', 'sendport-smtp-email-deliverability'); ?>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="sendport_from_name"><?php esc_html_e('From Sender Name', 'sendport-smtp-email-deliverability'); ?></label>
                            </th>
                            <td>
                                <input type="text" id="sendport_from_name" name="sendport_from_name" value="<?php echo esc_attr(get_option('sendport_from_name')); ?>" class="regular-text" placeholder="<?php echo esc_attr(get_bloginfo('name')); ?>" />
                                <p class="description">
                                    <?php esc_html_e('The friendly name displayed in recipient inboxes (defaults to Site Title).', 'sendport-smtp-email-deliverability'); ?>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><?php esc_html_e('Real-time Analytics', 'sendport-smtp-email-deliverability'); ?></th>
                            <td>
                                <fieldset>
                                    <label>
                                        <input type="checkbox" name="sendport_track_opens" value="1" <?php checked(get_option('sendport_track_opens', '1'), '1'); ?> />
                                        <?php esc_html_e('Enable real-time email open tracking', 'sendport-smtp-email-deliverability'); ?>
                                    </label><br>
                                    <label style="margin-top: 6px; display: inline-block;">
                                        <input type="checkbox" name="sendport_track_clicks" value="1" <?php checked(get_option('sendport_track_clicks', '1'), '1'); ?> />
                                        <?php esc_html_e('Enable click-through engagement tracking', 'sendport-smtp-email-deliverability'); ?>
                                    </label>
                                </fieldset>
                            </td>
                        </tr>
                    </table>

                    <?php submit_button(esc_html__('Save Sendport Credentials', 'sendport-smtp-email-deliverability')); ?>
                </form>

                <!-- Live Test Dispatch Box -->
                <div style="background: #ffffff; padding: 28px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <h3 style="margin-top: 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; font-size: 16px; font-weight: 700; color: #0f172a;">
                        <?php esc_html_e('Verify Email Deliverability (Live Test)', 'sendport-smtp-email-deliverability'); ?>
                    </h3>
                    <p style="color: #64748b; font-size: 13px; margin: 0 0 16px 0;">
                        <?php esc_html_e('Send an authenticated test message to verify your API Key and DNS records.', 'sendport-smtp-email-deliverability'); ?>
                    </p>

                    <form method="post" action="">
                        <?php wp_nonce_field('sendport_test_nonce_action', 'sendport_test_nonce_field'); ?>
                        <input type="hidden" name="sendport_test_action" value="1" />

                        <table class="form-table" role="presentation">
                            <tr>
                                <th scope="row">
                                    <label for="sendport_test_email"><?php esc_html_e('Recipient Email', 'sendport-smtp-email-deliverability'); ?></label>
                                </th>
                                <td>
                                    <input type="email" id="sendport_test_email" name="sendport_test_email" value="<?php echo esc_attr(wp_get_current_user()->user_email); ?>" class="regular-text" required />
                                </td>
                            </tr>
                        </table>

                        <p class="submit">
                            <input type="submit" class="button button-primary" value="<?php esc_attr_e('Send Test Email via Sendport', 'sendport-smtp-email-deliverability'); ?>" />
                        </p>
                    </form>
                </div>
            </div>
            <?php
        }
    }

    new Sendport_SMTP_Plugin();
}
