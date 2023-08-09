<?php
require('../functions/securer.php');
// Database connection settings
$host = "localhost";
$username = "signal";
$password = "8BAnEJMPtEBHnz1g";
$database = "signal_chat_app";

try {
    // Function to search for users based on the handle tag
    function searchUsersByHandleTag($connection, $handleTag)
    {
        $handleTag = '%' . $handleTag . '%'; // To perform a partial search

        $query = "SELECT first_name, last_name, handle_tag FROM users WHERE handle_tag LIKE :handleTag";

        $statement = $connection->prepare($query);
        $statement->bindParam(':handleTag', $handleTag, PDO::PARAM_STR);
        $statement->execute();

        $users = $statement->fetchAll(PDO::FETCH_ASSOC);
        if(isset($_COOKIE["HANDLE_TAG"]) && !empty($_COOKIE["HANDLE_TAG"])) {
            // Loop through the array and use unset() to remove the element with the handle
            for($i=0; $i < count($users); $i++) {
                if ($users[$i]["handle_tag"] == decrypt_data($_COOKIE["HANDLE_TAG"])) {
                    array_splice($users, $i, 1);
                    break;
                }
            }
        }
        return $users;
    }

    if (isset($_GET["handle_tag"]) && !empty($_GET["handle_tag"])) {    
        // Establishing a connection to the database using PDO
        $connection = new PDO("mysql:host=$host;dbname=$database", $username, $password);

        // Set the PDO error mode to exception
        $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        // Get the handle tag
        $handleTagToSearch = $_GET["handle_tag"];

        // Search for users with the provided handle tag
        $searchResults = searchUsersByHandleTag($connection, $handleTagToSearch);

        // Convert the search results to JSON format
        $jsonResults = json_encode($searchResults, JSON_PRETTY_PRINT);

        // Set the appropriate response header for JSON output
        header('Content-Type: application/json');

        // Output the JSON data
        echo $jsonResults;
    }
    else {
        echo json_encode([], JSON_PRETTY_PRINT);
    }
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
