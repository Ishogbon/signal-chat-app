<?php
function postCookiesFromReq($url, $postData) {
    // Initialize cURL session.
    $ch = curl_init();

    // Set the cURL options.
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));

    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Content-Type: application/x-www-form-urlencoded'
    ));
    // Execute the POST request.
    $response = curl_exec($ch);

    // Check for cURL errors.
    if (curl_errno($ch)) {
        // Handle the error here.
        echo 'cURL Error: ' . curl_error($ch);
    }

    // Get the cookies from the response headers.
    $cookies = [];
    preg_match_all('/^Set-Cookie:\s*([^;]*)/mi', $response, $matches);
    foreach ($matches[1] as $cookie) {
        parse_str($cookie, $cookieData);
        $cookies = array_merge($cookies, $cookieData);
    }

    // Add the cookies to the PHP header.
    foreach ($cookies as $name => $value) {
        setcookie($name, $value, path:"/");
    }

    // Close cURL session.
    curl_close($ch);

    // Return the response.
    return $response;
}
if (!isset($_COOKIE["HANDLE_TAG"]) && !$_COOKIE["HANDLE_TAG"]) {
    header("HTTP/1.1 302 Found");

    // Set the 'Location' header to the new URL.
    header("Location: " . "./login.php");
}
else {
    if (!isset($_COOKIE["JSESSIONID"])) {
        $handleTag = $_COOKIE["HANDLE_TAG"];
        postCookiesFromReq("http://localhost:8080/chatserver/auth_user_a934_2592_7283_58f3_fh34_2h45", ["handle_tag" => $handleTag]);
    }
}
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
        <link rel="stylesheet" href="./stylesheets/all_main.css">
        <link rel="stylesheet" href="./stylesheets/header_style.css">
        <link rel="stylesheet" href="./stylesheets/body_pages.css">
    </head>
    <body>
        <!--[if lt IE 7]>
            <p class="browsehappy">You are using an <strong>outdated</strong> browser. Please <a href="#">upgrade your browser</a> to improve your experience.</p>
        <![endif]-->
        <div id="inner-body">
            <div id="app-main">
                <header>
                    <div id="header-app-name">
                        ReText
                    </div>
                    <nav>
                        <ul id="navigation-sub">
                            <li class="navigators active-nav" id='chats-page-pointer'>
                                Chats
                            </li>
                            <li class="navigators" id='contacts-page-pointer'>
                                Contacts
                            </li>
                        </ul>
                    </nav>
                    
                </header>
                <div id="content-body">
                    <div id="chats-page" class="body-pages">
                        <!-- <div class="active-chats" data-user-handle-tag="jamesfrank">
                            <div class="user-name">
                                <span class="user-first-name">James</span> <span class="user-last-name">Frank</span>
                                <span class="user-handle">( @jamesfrank )</span>
                            </div>
                            <div class="recent-message">
                                <span class="recent-messages-count"> </span><span>Hello John! Are you comming to work today?</span>
                            </div>
                        </div> -->
                    </div>
                    <div id="contacts-page" class="body-pages page-hider">
                        <div id="contacts-search-bar">
                            <input id="user-search-input" placeholder="Search for any user on ReText" />
                        </div>
                        <div id="contacts-sub-page">
                            <!-- <div class="contact">
                                <div class="user-name">
                                    <span class="user-first-name">Ron</span> <span class="user-last-name">Allen</span>
                                    <span class="user-handle">( @ftman )</span>
                                </div>
                                <div class="user-about">
                                    <span>Hi, I'm a ReText user!</span>
                                </div>
                            </div> -->
                        </div>
                    </div>
                </div>
                <script src="./scripts/site/chatloader.js" async defer></script>
                <script src="./scripts/site/interaction.js" async defer></script>
                <script src="./scripts/encryption/external_modules/libsignal-protocol-javascript/dist/libsignal-protocol.js" async defer></script>
                <script src="./scripts/encryption/signal-encryption/session_generators.js" async defer></script>
                <script src="./scripts/communication/websocket.js" async defer></script>
            </div>
            <div id="active-user-chat-page" data-user-handle-tag="">
                <div id="chat-header">
                    <button id="exit-active-user-chat-page-btn">
                        <img src="./images/icons8-back-100.png" />
                    </button>
                    <div id="header-user-name">
                        <span id="user-first-name"></span> <span id="user-last-name"></span>
                        <span id="user-handle">( @ )</span>
                    </div>
                </div>
                <div id="chats">
                    <!-- <div class="message-bars"><p class="my-texts chat-texts">I'm coming rn</p></div>
                    <div class="message-bars"><p class="other-user-texts chat-texts">Alright bro</p></div> -->
                </div>
                <div id="message-bar">
                    <input type="text" placeholder="Start typing..." id="message-input"/>
                    <button id="message-send"><img src="./images/icons8-send-90.png" /></button>
                </div>
            </div>
        </div>
        
        
    </body>
</html>