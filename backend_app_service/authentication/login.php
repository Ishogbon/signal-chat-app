<?php
session_start();
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
    // Set the session username
    $_SESSION["email"] = $email;

    echo true;
    exit();
  } else {
    // The username or password is incorrect
    echo "Invalid login credentials";
  }
}

?>