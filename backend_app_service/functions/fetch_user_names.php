<?php
// Database connection settings
$host = "localhost";
$username = "signal";
$password = "8BAnEJMPtEBHnz1g";
$database = "signal_chat_app";

try {
    $dbh = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Error: " . $e->getMessage());
}

function getUserDetailsByHandle($dbh, $handleTag) {
    $stmt = $dbh->prepare("SELECT first_name, last_name FROM users WHERE handle_tag = :handle LIMIT 1");
    $stmt->bindParam(':handle', $handleTag, PDO::PARAM_STR);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        return $user;
    } else {
        return array("first_name" => "", "last_name" => "");
    }
}

// Assuming the handle tag is provided through a GET request parameter called 'handle_tag'
if (isset($_GET['handle_tag'])) {
    $handleTag = $_GET['handle_tag'];
    $userData = getUserDetailsByHandle($dbh, $handleTag);
    echo json_encode($userData);
} else {
    echo "Error: No handle tag provided.";
}
?>
