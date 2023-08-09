<?php
function checkAuthWithServer($url, $cookieValue) {
    // Initialize cURL session.
    $ch = curl_init();

    // Set the cURL options.
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    curl_setopt($ch, CURLOPT_COOKIE, $cookieValue[0] . '=' . $cookieValue[1]);

    // Execute the cURL request
    curl_exec($ch);

    // Check if the cURL request was successful and the HTTP status code is 200 (OK)
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if ($httpCode === 200) {
        return true; // User is signed in
    } else {
        return false; // User is not signed in
    }

    // Close the cURL session
    curl_close($ch);

}
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
    require('../backend_app_service/functions/securer.php');
    $handleTag = decrypt_data($_COOKIE["HANDLE_TAG"]);
    $jsession = '';
    if (isset($_COOKIE["JSESSIONID"])) {
        $jsession = $_COOKIE["JSESSIONID"];
    }
    if (!checkAuthWithServer("http://localhost:8080/chatserver/check_authentication", ["JSESSIONID", $jsession])) {
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
                    <span id="logout"><image id="logout-image" src="./images/logout-48.png"/></span>
                    <span id="create-group"><image id="crate-group-image" src="./images/group-60.png" onclick="groupChatModule.onNewGroupBar()"/></span>
                    <div id="wrapper">
                        <div id="group-create-bar">
                            <img id="turn-off-new-group-bar" src="./images/black-cancel-60.png" onclick="groupChatModule.offNewGroupBar()"/>
                            <h1>Create Group</h1>
                            <input type="text" id="group-title-input" placeholder="Enter group title (min: 6 chars)">
                            <div id="search-for-user">
                                <input id="group-user-search-input" placeholder="Search for user to add (min: 1 user)" />
                                <div id="searched-users">
                                    <div class="user-name">
                                        <!-- <span class="user-first-name">Ron</span> <span class="user-last-name">Allen</span>
                                        <br />
                                        <span class="user-handle">( @ftman )</span> -->
                                    </div>
                                </div>
                            </div>
                            <h2>Group Members</h2>
                            <div id="group-members-to-add">
                                <h3>Admin</h3>
                                <div id="group-admins"></div>
                                <h3>Members</h3>
                                <div id="group-members"></div>
                            </div>
                            <div id="create-new-group-bar">
                                <button id="create-new-group" onclick="groupChatModule.publishGroup()">Create</button>
                            </div>
                        </div>
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
                <script>
                    const clientHandleTag = <?php echo $handleTag ? '"'.$handleTag.'";' : '"";'; ?>
                </script>
                <script src="./scripts/site/chatloader.js" async defer></script>
                <script src="./scripts/site/groupChatloader.js" async defer></script>
                <script src="./scripts/site/interaction.js" async defer></script>
                <script src="./scripts/encryption/external_modules/libsignal-protocol-javascript/dist/libsignal-protocol.js" async defer></script>
                <script src="./scripts/encryption/signal-encryption/signal_store.js" async defer></script>
                <script src="./scripts/encryption/signal-encryption/signal_interface.js" async defer></script>
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