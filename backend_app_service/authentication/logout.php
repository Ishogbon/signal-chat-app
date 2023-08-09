<?php
// Delete the session cookie by setting the expiration date to one hour ago
setcookie("HANDLE_TAG", "", $expirationDate, '/', httponly:true);
setcookie("JSESSIONID", "", $expirationDate, '/', httponly:true);

// Redirect to the login page or any other appropriate page
header("Location: http://localhost/signal_chat_app/app/login.php");
exit();
?>
