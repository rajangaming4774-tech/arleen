<?php
// Enquiry form handler for arleenbuilders.com
// Sends the enquiry to the office inbox. Works with AJAX (JSON response) and plain form POST (redirect).

$TO      = 'info@arleenbuilders.com';
$FROM    = 'no-reply@arleenbuilders.com'; // must be an address on this domain for good deliverability
$SUBJECT = 'New website enquiry – Arleen Builders';

$isAjax = isset($_SERVER['HTTP_X_REQUESTED_WITH']);

function respond($ok, $message, $isAjax) {
    if ($isAjax) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok, 'message' => $message]);
    } else {
        header('Location: /contactus.php?sent=' . ($ok ? '1' : '0'));
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /contactus.php');
    exit;
}

// Honeypot: bots fill the hidden "website" field
if (!empty($_POST['website'])) {
    respond(true, 'Thank you! We will contact you shortly.', $isAjax);
}

$clean = function ($key, $max) {
    $v = isset($_POST[$key]) ? trim((string) $_POST[$key]) : '';
    $v = str_replace(["\r", "\n", "%0a", "%0d"], ' ', $v); // header injection guard
    return mb_substr(strip_tags($v), 0, $max);
};

$name     = $clean('name', 80);
$phone    = $clean('phone', 18);
$email    = $clean('email', 120);
$service  = $clean('service', 60);
$location = $clean('location', 120);
$message  = isset($_POST['message']) ? mb_substr(strip_tags(trim((string) $_POST['message'])), 0, 2000) : '';

if ($name === '' || $phone === '' || $service === '' || $message === '') {
    respond(false, 'Please fill in your name, phone number, service and project details.', $isAjax);
}
// Same rule as the form's pattern attribute and api/send-enquiry.js: digits, spaces, brackets, + and -
if (!preg_match('/^[0-9+()\s\-]{8,18}$/', $phone)) {
    respond(false, 'Please enter a valid phone number.', $isAjax);
}
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Please enter a valid email address.', $isAjax);
}

$body = "New enquiry from arleenbuilders.com\n\n"
      . "Name:     $name\n"
      . "Phone:    $phone\n"
      . "Email:    " . ($email ?: '-') . "\n"
      . "Service:  $service\n"
      . "Location: " . ($location ?: '-') . "\n\n"
      . "Message:\n$message\n\n"
      . "-- \nSent " . date('d M Y, h:i A') . " from IP " . ($_SERVER['REMOTE_ADDR'] ?? '-') . "\n";

$headers  = "From: Arleen Builders Website <$FROM>\r\n";
if ($email !== '') {
    $headers .= "Reply-To: $name <$email>\r\n";
}
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = @mail($TO, '=?UTF-8?B?' . base64_encode($SUBJECT) . '?=', $body, $headers);

if ($sent) {
    respond(true, 'Thank you, ' . $name . '! Your enquiry has been sent. We will call you within one working day.', $isAjax);
}
respond(false, 'Sorry, your message could not be sent. Please call +91 93833 41020 or email info@arleenbuilders.com.', $isAjax);
