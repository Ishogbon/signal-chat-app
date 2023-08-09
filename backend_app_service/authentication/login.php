<?php
require('../functions/securer.php');
// Database connection settings
$host = "localhost";
$username = "signal";
$password = "8BAnEJMPtEBHnz1g";
$database = "signal_chat_app";

// Create a PDO connection
try {
  $pdo = new PDO("mysql:host=$host;dbname=$database", $username, $password);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
  echo "Connection failed: " . $e->getMessage();
  exit();
}

function setLongLastingCookie($name, $value) {
    // Set the expiration date to a distant future (e.g., 10 years from now).
    $expirationDate = time() + (10 * 365 * 24 * 60 * 60); // 10 years in seconds

    // Set the cookie with the far-future expiration date. because it's localhost, I won't be setting the secure to true, if in production, set secure to true
    setcookie($name, encrypt_data($value), $expirationDate, '/', httponly:true);
}

// Check if the login form was submitted
if (isset($_POST["email"], $_POST["password"])) {
  // Get the username and password from the form
  $email = $_POST["email"];
  $password = $_POST["password"];

  // Check if the username and password exist in the database
  $sql = "SELECT * FROM users WHERE email = :email";
  $stmt = $pdo->prepare($sql);
  $stmt->bindValue(":email", $email);
  $stmt->execute();

  $user_info = $stmt->fetch(PDO::FETCH_ASSOC);
  // If the user exists, log them in
  if ($stmt->rowCount() == 1 && password_verify($password, $user_info["password"])) {
    setLongLastingCookie("HANDLE_TAG", $user_info["handle_tag"]);

    echo true;
    exit();
  } else {
    // The username or password is incorrect
    echo "Invalid login credentials";
  }
}

?>