const chatModule = {
    userNames: {},
    readChats: {},
    unreadChats: {},
    chatPage: document.getElementById('active-user-chat-page'),
    loadChats() {
        try {
            if (!Object.is(localStorage.getItem('readChats'), null)) {
                this.readChats = JSON.parse(localStorage.getItem('readChats'));
            }
        } catch {
            this.readChats = {};
        }

        try {
            if (!Object.is(localStorage.getItem('unreadChats'), null)) {
                this.unreadChats = JSON.parse(localStorage.getItem('unreadChats'));
            }
        } catch {
            this.unreadChats = {};
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
    async incomingMessage(message) {
        let userHandleTag = '';
        try {
            userHandleTag = this.chatPage.getAttribute('data-user-handle-tag');
        } catch {}

        message.message = JSON.parse(message.message);
        console.log(message);
        await signalProtocol.decryptMessage(message);

        if (message.messageType === 'group-create') {
            groupChatModule.receiveNewGroup(message.message);
            this.renderChatsPage();
            return;
        }

        if (message.messageType.startsWith('group-message.')) {
            const groupId = message.messageType.substring(14);
            if (!groupChatModule.fetchGroup(groupId)) {
                return;
            }

            if (groupId === userHandleTag) {
                if (typeof this.readChats[groupId] !== 'object') {
                    this.readChats[groupId] = [];
                }

                this.readChats[groupId].push(message);
                this.appendToCurrentActivePage(userHandleTag, message);
            } else {
                if (typeof this.unreadChats[groupId] !== 'object') {
                    this.unreadChats[groupId] = [];
                }

                this.unreadChats[groupId].push(message);
            }
        } else if (message.messageType === 'client-message') {
            if (message.sender === userHandleTag) {
                if (typeof this.readChats[message.sender] !== 'object') {
                    this.readChats[message.sender] = [];
                }

                this.readChats[message.sender].push(message);
                this.appendToCurrentActivePage(userHandleTag, message);
            } else {
                if (typeof this.unreadChats[message.sender] !== 'object') {
                    this.unreadChats[message.sender] = [];
                }

                this.unreadChats[message.sender].push(message);
            }
        }

        this.renderChatsPage();
        this.saveChats();
    },
    appendToCurrentActivePage(userHandleTag, message) {
        const chats = document.getElementById('chats');
        const chat = document.createElement('div');
        chat.classList.add('message-bars');
        if (message.messageType === 'client-message') {
            if (message.sender === userHandleTag) {
                chat.innerHTML = `<div class="message-bars"><p class="other-user-texts chat-texts">${message.message}</p>`;
            } else {
                chat.innerHTML = `<div class="message-bars"><p class="my-texts chat-texts">${message.message}</p></div>`;
            }
        } else if (message.sender.length === 0) {
            chat.innerHTML = `<div class="message-bars"><p class="site-texts chat-texts">${message.message}</p></div>`;
        } else if (message.messageType.startsWith('group-message')) {
            if (message.sender === clientHandleTag) {
                chat.innerHTML = `<div class="message-bars"><p class="my-texts chat-texts">${message.message}</p></div>`;
            } else {
                this.fetchUserNames(message.sender, names => {
                    chat.innerHTML = `<div class="message-bars">
                        <p class="other-user-texts chat-texts">
                            <span class='other-user-names'>
                                <span>${names.first_name}</span>
                                <span>${names.last_name}</span>
                                <span>( @${message.sender} )</span>
                            </span>
                            </br>
                            ${message.message}
                        </p>
                    </div>`;
                });
            }
        }

        chats.append(chat);

        chats.scrollTop = chats.scrollHeight;
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
        const unreadChatsRendered = new Set();

        // Render groups on chatsPage
        for (const group of groupChatModule.groups) {
            if (!(typeof this.unreadChats[group.groupId] === 'object') && !(typeof this.readChats[group.groupId] === 'object')) {
                this.unreadChats[group.groupId] = [{
                    message: 'Send a message to your group members',
                    messageType: 'group-message',
                    recipient: '',
                    sender: '',
                }];
                console.log('creac empty group');
            }
        }

        for (const message of Object.entries(this.unreadChats)) {
            const chat = document.createElement('div');
            chat.classList.add('active-chats');
            chat.setAttribute('data-user-handle-tag', message[0]);

            const group = groupChatModule.fetchGroup(message[0]);
            chat.addEventListener('click', () => {
                if (group) {
                    activateChatPage(message[0], true, group.groupTitle, group.groupId);
                } else {
                    activateChatPage(message[0]);
                }
            });
            if (group) {
                chat.innerHTML = `
                    <div class="group-title-name">
                        <span class="group-name">${group.groupTitle}</span>
                    </div>
                    <div class="recent-message">
                        <span class="recent-messages-count">&nbsp&nbsp</span><span>${message[1][message[1].length - 1].sender || 'ReText'}: ${message[1][message[1].length - 1].message}</span>
                    </div>
                `;
                chatPage.append(chat);
            } else {
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

            unreadChatsRendered.add(message[0]);
        }

        for (const message of Object.entries(this.readChats)) {
            if (message[1].length >= 1 && !unreadChatsRendered.has(message[0])) {
                const chat = document.createElement('div');
                chat.classList.add('active-chats');
                chat.setAttribute('data-user-handle-tag', message[0]);
                const group = groupChatModule.fetchGroup(message[0]);
                chat.addEventListener('click', () => {
                    if (group) {
                        activateChatPage(message[0], true, group.groupTitle, group.groupId);
                    } else {
                        activateChatPage(message[0]);
                    }
                });
                if (group) {
                    chat.innerHTML = `
                        <div class="group-title-name">
                            <span class="group-name">${group.groupTitle}</span>
                        </div>
                        <div class="recent-message">
                            <span>${message[1][message[1].length - 1].sender || 'ReText'}: ${message[1][message[1].length - 1].message}</span>
                        </div>
                    `;
                    chatPage.append(chat);
                } else {
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
            }
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
    async sendMessage(message) {
        const userHandleTag = this.chatPage.getAttribute('data-user-handle-tag');
        if (message.recipient === userHandleTag || message.messageType.startsWith('group-')) {
            if (message.messageType === 'client-message') {
                if (typeof this.readChats[message.recipient] !== 'object') {
                    this.readChats[message.recipient] = [];
                }

                this.readChats[message.recipient].push(message);

                this.appendToCurrentActivePage(userHandleTag, message);
                this.saveChats();
            } else if (message.messageType.startsWith('group-message.')) {
                const groupId = message.messageType.substring(14);
 
                this.readChats[groupId].push(message);

                this.appendToCurrentActivePage(userHandleTag, message);
                this.saveChats();
            }

            this.renderChatsPage();

            const encryptedMessage = {...message};
            console.log(encryptedMessage);
            if (await signalProtocol.encryptMessage(encryptedMessage)) {
                console.log('message sent');
                encryptedMessage.message = JSON.stringify(encryptedMessage.message);
                socket.send(JSON.stringify(encryptedMessage));
            }
        }
    },
};

window.onload = function () {
    chatModule.loadChats();
    chatModule.renderChatsPage();
};
