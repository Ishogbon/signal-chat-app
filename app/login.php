<?php

?>
<!DOCTYPE html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]>      <html class="no-js"> <!--<![endif]-->
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title></title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="./stylesheets/login.css">
    </head>
    <body>
        <!--[if lt IE 7]>
            <p class="browsehappy">You are using an <strong>outdated</strong> browser. Please <a href="#">upgrade your browser</a> to improve your experience.</p>
        <![endif]-->
        <form id="login-form">
            <div id="auth-page-header">
                <h1> Sign In for ReText </h1>
            </div>
            <div class="form-inputs-bar">
                <div id="site-name">
                    <span>ReText</span>
                </div>
                <div id="form-error-bar">
                    
                </div>
                <div id="email" class="login-input-bars">
                    <input name="email" placeholder="Email" type="text" class="login-form-input" required/>
                </div>
                <div id="password" class="login-input-bars">
                    <input name="password" placeholder="Password" type="password" class="login-form-input" required/>
                </div>
                <p id="other-reg">Do not have an account? <a href="./registration.php">Sign Up</a></p>
                <div id="submit-button" class="login-button-bars">
                    <button class="login-button">Sign In</button>
                </div>
            </div>
        </form>
        <script src="./scripts/site/authentications.js" async defer></script>
    </body>
</html>