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
        <link rel="stylesheet" href="./stylesheets/registration.css">
    </head>
    <body>
        <!--[if lt IE 7]>
            <p class="browsehappy">You are using an <strong>outdated</strong> browser. Please <a href="#">upgrade your browser</a> to improve your experience.</p>
        <![endif]-->
        <form id="registration-form">
            <div id="auth-page-header">
                <h1> Sign Up for ReText </h1>
                <p>Sign up now and start texting family and friends</p>
            </div>
            <div class="form-inputs-bar">
                <div id="site-name">
                    <span>ReText</span>
                </div>
                <div id="form-error-bar">
                    
                </div>
                <div id="first-name" class="registration-input-bars">
                    <input name="first_name" placeholder="First Name" type="text" class="registration-form-input" maxlength="50"/>
                </div>
                <div id="surname" class="registration-input-bars">
                    <input name="last_name" placeholder="Last Name" type="text" class="registration-form-input"  maxlength="50"/>
                </div>
                <div id="handle-tag" class="registration-input-bars">
                    <input name="handle_tag" placeholder="Handle Tag" type="text" class="registration-form-input" maxlength="50" required/>
                </div>
                <div id="email" class="registration-input-bars">
                    <input name="email" placeholder="Email" type="email" class="registration-form-input" maxlength="255" required/>
                </div>
                <div id="password" class="registration-input-bars">
                    <input name="password" placeholder="Password" type="password" class="registration-form-input" minlength="8" required/>
                </div>
                <p id="other-reg">Already have an account? <a href="./login.php">Sign In</a></p>
                <div id="submit-button" class="registration-button-bars">
                    <button class="registration-button">Register</button>
                </div>
            </div>
        </form>
        <script src="./scripts/site/authentications.js" async defer></script>
    </body>
</html>