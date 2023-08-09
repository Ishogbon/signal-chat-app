<?php
$secretKey = 'this_is_the_signal_chat_app_key';
// Encrypt the data
function encrypt_data($data) {
    global $secretKey;
    return base64_encode(openssl_encrypt($data, 'AES-256-CBC', $secretKey, 0, substr($secretKey, 0, 16)));
}

// Decrypt the data
function decrypt_data($encryptedData) {
    global $secretKey;
    return openssl_decrypt(base64_decode($encryptedData), 'AES-256-CBC', $secretKey, 0, substr($secretKey, 0, 16));
}

?>