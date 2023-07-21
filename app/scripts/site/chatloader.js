const chatModule = {
    userNames: {},
    readChats: {},
    unreadChats: {},
    chatPage: document.getElementById('active-user-chat-page'),
    loadChats() {
        if (!Object.is(localStorage.getItem('readChats'), null)) {
            this.readChats = JSON.parse(localStorage.getItem('readChats'));
        }

        if (!Object.is(localStorage.getItem('unreadChats'), null)) {
            this.unreadChats = JSON.parse(localStorage.getItem('unreadChats'));
        }
    },
    saveChats() {
        localStorage.setItem('readChats', JSON.stringify(this.readChats));
        localStorage.setItem('unreadChats', JSON.stringify(this.unreadChats));
    },
    fetchUserNames(handleTag, callback) {
        // Replace 'your_server_endpoint' with the actual endpoint to fetch user data
        fetch('http://localhost/signal_chat_app/backend_app_service/functions/fetch_user_names.php?handle_tag=' + handleTag)
            .then(response => response.json())
            .then(data => callback(data))
            .catch(error => console.log(error));
    },
    updateNameOnActiveChatPage(userHandle) {
        this.fetchUserNames(userHandle, names => {
            document.getElementById('user-first-name').innerHTML = names.first_name;
            document.getElementById('user-last-name').innerHTML = names.last_name;
        });
    },
    getUserDetails(handleTag, callback) {
        // eslint-disable-next-line no-prototype-builtins
        if (this.userNames.hasOwnProperty(handleTag)) {
            // Data already exists in the object, return it
            callback(this.userNames[handleTag]);
        } else {
            // Data doesn't exist, fetch it from the server and store it in the object
            this.fetchUserNames(handleTag, userData => {
                this.userNames[handleTag] = userData;
                callback(userData);
            });
        }
    },
    // For incoming messages, the recipient is the sender
    incomingMessage(message) {
        const userHandleTag = this.chatPage.getAttribute('data-user-handle-tag');
        if (message.recipient === userHandleTag) {
            if (typeof this.readChats[message.recipient] !== 'object') {
                this.readChats[message.recipient] = [];
            }

            this.readChats[message.recipient].push(message);
            this.appendToCurrentActivePage(userHandleTag, message);
        } else {
            if (typeof this.unreadChats[message.recipient] !== 'object') {
                this.unreadChats[message.recipient] = [];
            }

            this.unreadChats[message.recipient].push(message);
        }

        this.renderChatsPage();
        this.saveChats();
    },
    appendToCurrentActivePage(userHandleTag, message) {
        const chats = document.getElementById('chats');
        const chat = document.createElement('div');
        chat.classList.add('message-bars');
        if (message.recipient === userHandleTag) {
            chat.innerHTML = `<p class="other-user-texts chat-texts">${message.message}</p>`;
            chats.append(chat);
        } else {
            chat.innerHTML = `<div class="message-bars"><p class="my-texts chat-texts">${message.message}</p></div>`;
            chats.append(chat);
        }
    },
    resolveUnreadMessagesToRead(userHandleTag) {
        // If there are no active entry for this user, create for them
        if (typeof this.readChats[userHandleTag] !== 'object') {
            this.readChats[userHandleTag] = [];
        }

        if (typeof this.unreadChats[userHandleTag] !== 'object') {
            this.unreadChats[userHandleTag] = [];
        }

        for (const message of this.unreadChats[userHandleTag]) {
            this.readChats[userHandleTag].push(message);
        }

        delete this.unreadChats[userHandleTag];
        this.saveChats();
    },
    renderChatsPage() {
        const chatPage = document.getElementById('chats-page');
        chatPage.innerHTML = '';
        for (const message of Object.entries(this.unreadChats)) {
            const chat = document.createElement('div');
            chat.classList.add('active-chats');
            chat.setAttribute('data-user-handle-tag', message[0]);
            chat.addEventListener('click', () => {
                // eslint-disable-next-line no-undef
                activateChatPage(message[0]);
            });
            this.fetchUserNames(message[0], names => {
                chat.innerHTML = `
                    <div class="user-name">
                        <span class="user-first-name">${names.first_name}</span> <span class="user-last-name">${names.last_name}</span>
                        <span class="user-handle">( @${message[0]} )</span>
                    </div>
                    <div class="recent-message">
                        <span class="recent-messages-count">&nbsp&nbsp</span><span>${message[1][message[1].length - 1].message}</span>
                    </div>
                `;
                chatPage.append(chat);
            });
        }

        for (const message of Object.entries(this.readChats)) {
            const chat = document.createElement('div');
            chat.classList.add('active-chats');
            chat.setAttribute('data-user-handle-tag', message[0]);
            chat.addEventListener('click', () => {
                // eslint-disable-next-line no-undef
                activateChatPage(message[0]);
            });
            this.fetchUserNames(message[0], names => {
                chat.innerHTML = `
                    <div class="user-name">
                        <span class="user-first-name">${names.first_name}</span> <span class="user-last-name">${names.last_name}</span>
                        <span class="user-handle">( @${message[0]} )</span>
                    </div>
                    <div class="recent-message">
                        <span>${message[1][message[1].length - 1].message}</span>
                    </div>
                `;
                chatPage.append(chat);
            });
        }
    },
    renderActiveChatPage(userHandleTag) {
        this.updateNameOnActiveChatPage(userHandleTag);
        document.getElementById('chats').innerHTML = '';
        if (typeof this.readChats[userHandleTag] !== 'object') {
            this.readChats[userHandleTag] = [];
        }

        for (const message of this.readChats[userHandleTag]) {
            this.appendToCurrentActivePage(userHandleTag, message);
        }
    },
    sendMessage(message) {
        const userHandleTag = this.chatPage.getAttribute('data-user-handle-tag');
        if (message.recipient === userHandleTag) {
            if (typeof this.readChats[message.recipient] !== 'object') {
                this.readChats[message.recipient] = [];
            }

            // eslint-disable-next-line no-undef
            socket.send(JSON.stringify(message));

            const messageRecipient = message.recipient;
            // Recipient acts as a sender/receiver depending on the context, since i'm the one sending from my end, need to change to me
            message.recipient = 'me';
            this.readChats[messageRecipient].push(message);
            this.appendToCurrentActivePage(userHandleTag, message);
            this.saveChats();
            this.renderChatsPage();
        }
    },
};

chatModule.loadChats();
chatModule.renderChatsPage();
