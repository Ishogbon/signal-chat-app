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
        <div id="app-main">
            <header >
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
                <div class="active-chat">
                    <div class="user-name">
                        <span class="user-first-name">James</span> <span class="user-last-name">Frank</span>
                        <span class="user-handle">( @jamesfrank )</span>
                    </div>
                    <div class="recent-message">
                        <span class="recent-messages-count">1</span><span>Hello John! Are you comming to work today?</span>
                    </div>
                </div>
                <div class="active-chat">
                    <div class="user-name">
                        <span class="user-first-name">Ellen</span> <span class="user-last-name">Wright</span>
                        <span class="user-handle">( @ewright )</span>
                    </div>
                    <div class="recent-message">
                        <span class="recent-messages-count">2</span><span>Yo J, Wanna hangout?</span>
                    </div>
                </div>
                <div class="active-chat">
                    <div class="user-name">
                        <span class="user-first-name">Ron</span> <span class="user-last-name">Allen</span>
                        <span class="user-handle">( @ftman )</span>
                    </div>
                    <div class="recent-message">
                        <span>Bro, I just got a promotion, I'm at the bar wanna celebrate?</span>
                    </div>
                </div>
                <div class="active-chat">
                    <div class="user-name">
                        <span class="user-first-name">Alex</span> <span class="user-last-name">Erman</span>
                        <span class="user-handle">( @dbizguy )</span>
                    </div>
                    <div class="recent-message">
                        <span>Are you home?</span>
                    </div>
                </div>
            </div>
            <div id="contacts-page" class="body-pages page-hider">
                <div id="contacts-search-bar">
                    <input id="user-search-input" placeholder="Search for any user on ReText" />
                </div>
                <div id="contacts-sub-page">
                    <div class="contact">
                        <div class="user-name">
                            <span class="user-first-name">James</span> <span class="user-last-name">Frank</span>
                            <span class="user-handle">( @jamesfrank )</span>
                        </div>
                        <div class="user-about">
                            <span>Always chillin', Always vibin'</span>
                        </div>
                    </div>
                    <div class="contact">
                        <div class="user-name">
                            <span class="user-first-name">Ellen</span> <span class="user-last-name">Wright</span>
                            <span class="user-handle">( @ewright )</span>
                        </div>
                        <div class="user-about">
                            <span>Hi, I'm a ReText user!</span>
                        </div>
                    </div>
                    <div class="contact">
                        <div class="user-name">
                            <span class="user-first-name">Ron</span> <span class="user-last-name">Allen</span>
                            <span class="user-handle">( @ftman )</span>
                        </div>
                        <div class="user-about">
                            <span>Hi, I'm a ReText user!</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <script src="./scripts/site/interaction.js" async defer></script>
        <script src="./scripts/encryption/external_modules/libsignal-protocol-javascript/dist/libsignal-protocol.js" async defer></script>
        <script src="./scripts/encryption/signal-encryption/session_generators.js" async defer></script>
        </div>
        
    </body>
</html>