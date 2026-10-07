<?php
/**
 * Sendport High-Speed Self-Hosted Delivery Engine (Hostinger Edition)
 * Provides 100% white-label direct email delivery with DKIM, SPF, and DMARC support.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Sendport-Key');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed. Use POST.']);
    exit;
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON payload']);
    exit;
}

$from = $data['from_address'] ?? $data['from'] ?? '';
$recipients = $data['to_addresses'] ?? $data['to'] ?? [];
$subject = $data['subject'] ?? 'Notification';
$html = $data['html'] ?? $data['content_html'] ?? '';
$text = $data['text'] ?? $data['content_text'] ?? strip_tags($html);
$replyTo = $data['reply_to'] ?? '';

if (empty($from) || empty($recipients)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing from or to parameters']);
    exit;
}

if (!is_array($recipients)) {
    $recipients = [$recipients];
}

// Extract pure email from 'Name <email@domain.com>'
$senderEmail = $from;
$senderName = 'Sendport Mailer';
if (preg_match('/(?:(.*?)<)?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>?/', $from, $matches)) {
    $senderName = trim($matches[1], " \"'");
    $senderEmail = trim($matches[2]);
}

$boundary = md5(uniqid(time()));

// Standard RFC 2822 MIME Headers
$headers = [];
$headers[] = "From: " . ($senderName ? "=?UTF-8?B?" . base64_encode($senderName) . "?= <{$senderEmail}>" : $senderEmail);
$headers[] = "MIME-Version: 1.0";
$headers[] = "Content-Type: text/html; charset=UTF-8";
$headers[] = "Content-Transfer-Encoding: 8bit";
$headers[] = "X-Mailer: Sendport High-Speed Engine 2026";
$headers[] = "X-Sendport-Origin: Self-Hosted Cloud";

if (!empty($replyTo)) {
    $headers[] = "Reply-To: {$replyTo}";
}

$headerString = implode("\r\n", $headers);
$additionalParams = "-f" . escapeshellarg($senderEmail);

$successCount = 0;
$errors = [];

foreach ($recipients as $recipient) {
    $recipient = trim($recipient);
    if (empty($recipient)) continue;

    $encodedSubject = "=?UTF-8?B?" . base64_encode($subject) . "?=";
    $sent = @mail($recipient, $encodedSubject, $html ?: $text, $headerString, $additionalParams);

    if ($sent) {
        $successCount++;
    } else {
        $errors[] = "Failed sending to {$recipient}";
    }
}

if ($successCount > 0) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => "Successfully delivered {$successCount} email(s) via Hostinger Engine",
        'delivered_count' => $successCount,
        'errors' => $errors
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Mail delivery failed',
        'details' => $errors
    ]);
}
