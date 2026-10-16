<?php
/**
 * Plugin Name: Sendport SMTP & Email Deliverability
 * Plugin URI: https://getsendport.com/integrations/wordpress
 * Description: Ultra-fast, 99.9% inbox deliverability for WordPress and WooCommerce powered by Sendport REST API & 2048-bit RSA DKIM.
 * Version: 1.0.0
 * Author: Sendport Technologies Inc.
 * Author URI: https://getsendport.com
 * License: GPL-2.0+
 * Text Domain: sendport-smtp
 */

if (!defined('ABSPATH')) {
    exit;
}

class Sendport_SMTP_Plugin {
    const API_ENDPOINT = 'https://getsendport.com/api/v1/emails/send';

    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_filter('pre_wp_mail', array($this, 'intercept_wp_mail'), 10, 2);
    }

    public function add_admin_menu() {
        add_options_page(
            'Sendport SMTP Settings',
            'Sendport SMTP',
            'manage_options',
            'sendport-smtp',
            array($this, 'render_settings_page')
        );
    }

    public function register_settings() {
        register_setting('sendport_smtp_group', 'sendport_api_key');
        register_setting('sendport_smtp_group', 'sendport_from_email');
        register_setting('sendport_smtp_group', 'sendport_from_name');
        register_setting('sendport_smtp_group', 'sendport_track_opens');
        register_setting('sendport_smtp_group', 'sendport_track_clicks');
    }

    public function intercept_wp_mail($return, $atts) {
        $api_key = get_option('sendport_api_key');
        if (empty($api_key)) {
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
        $is_html = (strpos($message, '<html') !== false || strpos($message, '<body') !== false || strpos($message, '<p') !== false || strpos($message, '<br') !== false);

        $payload = array(
            'from' => $from_header,
            'to' => $to,
            'subject' => $subject,
            'track_opens' => get_option('sendport_track_opens', '1') === '1',
            'track_clicks' => get_option('sendport_track_clicks', '1') === '1',
        );

        if ($is_html) {
            $payload['html'] = $message;
        } else {
            $payload['text'] = $message;
            $payload['html'] = nl2br(esc_html($message));
        }

        $response = wp_remote_post(self::API_ENDPOINT, array(
            'method' => 'POST',
            'timeout' => 15,
            'headers' => array(
                'Authorization' => 'Bearer ' . trim($api_key),
                'Content-Type' => 'application/json',
                'User-Agent' => 'Sendport-WordPress/' . get_bloginfo('version'),
            ),
            'body' => wp_json_encode($payload),
        ));

        if (is_wp_error($response)) {
            error_log('[Sendport SMTP Error] ' . $response->get_error_message());
            return false;
        }

        $code = wp_remote_retrieve_response_code($response);
        return ($code >= 200 && $code < 300);
    }

    public function render_settings_page() {
        $test_result = null;

        if (isset($_POST['sendport_test_action']) && check_admin_referer('sendport_test_nonce')) {
            $test_to = sanitize_email($_POST['sendport_test_email']);
            if (!empty($test_to)) {
                $subject = 'Sendport SMTP Test Email — ' . get_bloginfo('name');
                $message = '<h3>Congratulations!</h3><p>Your WordPress site is now successfully delivering authenticated, 2048-bit DKIM signed emails via Sendport.</p><p>Timestamp: ' . current_time('mysql') . '</p>';
                
                $sent = wp_mail($test_to, $subject, $message);
                $test_result = $sent 
                    ? array('success' => true, 'message' => 'Test email successfully dispatched to ' . esc_html($test_to) . '! Check your inbox.')
                    : array('success' => false, 'message' => 'Failed to dispatch test email. Please verify your Sendport API Key and verified domain in Sendport Dashboard.');
            }
        }
        ?>
        <div class="wrap" style="max-width: 800px; margin-top: 24px;">
            <div style="background: #0f172a; color: #fff; padding: 24px; border-radius: 12px; margin-bottom: 24px; border: 1px solid #1e293b;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">⚡ Sendport SMTP Delivery</h1>
                        <p style="color: #94a3b8; font-size: 13px; margin: 6px 0 0 0;">The Developer-First Transactional Email Engine for WordPress & WooCommerce</p>
                    </div>
                    <a href="https://getsendport.com/dashboard/api-keys" target="_blank" style="background: #0284c7; color: #fff; text-decoration: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 12px;">Get API Key →</a>
                </div>
            </div>

            <?php if ($test_result): ?>
                <div style="padding: 14px 18px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; <?php echo $test_result['success'] ? 'background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;' : 'background: #fef2f2; color: #991b1b; border: 1px solid #fecaca;'; ?>">
                    <strong><?php echo $test_result['success'] ? '✓ Success:' : '✕ Error:'; ?></strong> <?php echo $test_result['message']; ?>
                </div>
            <?php endif; ?>

            <form method="post" action="options.php" style="background: #fff; padding: 28px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                <?php settings_fields('sendport_smtp_group'); ?>
                
                <h3 style="margin-top: 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; font-size: 16px;">API Credentials</h3>
                <table class="form-table">
                    <tr>
                        <th scope="row"><label for="sendport_api_key">Sendport API Key</label></th>
                        <td>
                            <input type="password" id="sendport_api_key" name="sendport_api_key" value="<?php echo esc_attr(get_option('sendport_api_key')); ?>" class="regular-text" placeholder="sk_live_..." required />
                            <p class="description">Found in your <a href="https://getsendport.com/dashboard/api-keys" target="_blank">Sendport Dashboard &gt; API Keys</a>.</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="sendport_from_email">From Email Address</label></th>
                        <td>
                            <input type="email" id="sendport_from_email" name="sendport_from_email" value="<?php echo esc_attr(get_option('sendport_from_email')); ?>" class="regular-text" placeholder="hello@yourdomain.com" />
                            <p class="description">Must match a verified sending domain configured in Sendport.</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="sendport_from_name">From Sender Name</label></th>
                        <td>
                            <input type="text" id="sendport_from_name" name="sendport_from_name" value="<?php echo esc_attr(get_option('sendport_from_name')); ?>" class="regular-text" placeholder="<?php echo esc_attr(get_bloginfo('name')); ?>" />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Tracking Preferences</th>
                        <td>
                            <label>
                                <input type="checkbox" name="sendport_track_opens" value="1" <?php checked(get_option('sendport_track_opens', '1'), '1'); ?> />
                                Enable Real-time Open Tracking
                            </label><br>
                            <label>
                                <input type="checkbox" name="sendport_track_clicks" value="1" <?php checked(get_option('sendport_track_clicks', '1'), '1'); ?> />
                                Enable Real-time Click Tracking
                            </label>
                        </td>
                    </tr>
                </table>

                <?php submit_button('Save Sendport Credentials'); ?>
            </form>

            <div style="background: #fff; padding: 28px; border-radius: 12px; border: 1px solid #e2e8f0;">
                <h3 style="margin-top: 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; font-size: 16px;">Test Your Email Delivery</h3>
                <form method="post" action="">
                    <?php wp_nonce_field('sendport_test_nonce'); ?>
                    <input type="hidden" name="sendport_test_action" value="1" />
                    <table class="form-table">
                        <tr>
                            <th scope="row"><label for="sendport_test_email">Recipient Email</label></th>
                            <td>
                                <input type="email" id="sendport_test_email" name="sendport_test_email" value="<?php echo esc_attr(wp_get_current_user()->user_email); ?>" class="regular-text" required />
                                <p class="description">Enter an email to receive an instant live test message.</p>
                            </td>
                        </tr>
                    </table>
                    <p class="submit">
                        <input type="submit" class="button button-primary" value="Send Test Email via Sendport" />
                    </p>
                </form>
            </div>
        </div>
        <?php
    }
}

new Sendport_SMTP_Plugin();
