<?php
require('../functions/securer.php');

if (!isset($_POST['first_name'], $_POST['last_name'], $_POST['handle_tag'], $_POST['email'], $_POST['password'])) {
    die("One or more input details wasn't received by server.");
}
$firstName = $_POST['first_name'];
$lastName = $_POST['last_name'];
$handleTag = $_POST['handle_tag'];
$email = $_POST['email'];
$password = $_POST['password'];
if (empty($firstName) || empty($lastName) || empty($handleTag) || empty($email) || empty($password)) {
    die("Please fill in all required fields.");
}

// Database connection settings
$host = "localhost";
$username = "signal";
$srv_password = "8BAnEJMPtEBHnz1g";
$database = "signal_chat_app";

// Create a PDO connection
try {
    $conn = new PDO("mysql:host=$host;dbname=$database", $username, $srv_password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

function setLongLastingCookie($name, $value) {
    // Set the expiration date to a distant future (e.g., 10 years from now).
    $expirationDate = time() + (10 * 365 * 24 * 60 * 60); // 10 years in seconds

    // Set the cookie with the far-future expiration date. because it's localhost, I won't be setting the secure to true, if in production, set secure to true
    setcookie($name, encrypt_data($value), $expirationDate, '/', httponly:true);
}


// Additional validation checks can be performed
// Check if first name is no more than 50 characters
if (strlen($firstName) > 50) {
    die("First name should not exceed 50 characters.");
}

// Check if last name is no more than 50 characters
if (strlen($lastName) > 50) {
    die("Last name should not exceed 50 characters.");
}

// Check if handle tag no more than 50 characters
if (strlen($handleTag) > 50) {
    die("Handle tag should not exceed 50 characters.");
}

// Check if last name is no more than 255 characters
if (strlen($email) > 255) {
    die("Last name should not exceed 255 characters.");
}

// Check password length
if (strlen($password) < 8) {
    die("Password must be at least 8 characters long.");
}

// Check if email is valid
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    die("Invalid email format.");
}
// Check if names contain only alphabets
if (!preg_match('/^[A-Za-z]+$/', $firstName) || !preg_match('/^[A-Za-z]+$/', $lastName)) {
    die("Names should only contain alphabets.");
}

// Check if handle_tag contains sensitive characters (e.g., special characters, spaces)
if (preg_match('/[^a-zA-Z0-9_]/', $handleTag)) {
    die("Handle tag should not contain sensitive characters.");
}
$checkHandleTagQuery = "SELECT * FROM users WHERE handle_tag = :handle_tag";

$handleTagStmt = $conn->prepare($checkHandleTagQuery);
$handleTagStmt->execute(['handle_tag' => $handleTag]);

if ($handleTagStmt->rowCount() > 0) {
    die("Handle tag already exists. Please choose a different handle tag.");
}
$checkEmailQuery = "SELECT * FROM users WHERE email = :email";

$emailStmt = $conn->prepare($checkEmailQuery);
$emailStmt->execute(['email' => $email]);
if ($emailStmt->rowCount() > 0) {
    die("Email already exists. Please use a different email address.");
}

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$insertQuery = "INSERT INTO users (first_name, last_name, handle_tag, email, password) VALUES (:first_name, :last_name, :handle_tag, :email, :password)";

$insertStmt = $conn->prepare($insertQuery);

$insertStmt->execute([
    'first_name' => $firstName,
    'last_name' => $lastName,
    'handle_tag' => $handleTag,
    'email' => $email,
    'password' => $hashedPassword
]);

if ($insertStmt->rowCount() > 0) {
    setLongLastingCookie("HANDLE_TAG", $handleTag);
    echo true;
} else {
    echo "Error in registration. Please try again.";
}

$conn = null

// bradleyt1886@gmail.com:Rachel20213614
?>