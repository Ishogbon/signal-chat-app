const contentBody = document.getElementById('content-body');

// All nav pointers in the web app. Must be equal to the web pages
const chatsPagePointer = document.getElementById('chats-page-pointer');
const contactsPagePointer = document.getElementById('contacts-page-pointer');

// All pages in the web app. Must be equal to nav pointers
const chatsPage = document.getElementById('chats-page');
const contactsPage = document.getElementById('contacts-page');

const navigationElements = document.getElementById('navigation-sub').children;

function deactivateActiveNav() {
    // Loop over the navigation elements and remove the active-nav(purpose to destyle the active nav)
    for (let i = 0; i < navigationElements.length; i++) {
        navigationElements[i].classList.remove('active-nav');
    }
}

function deactivateActiveContentPage() {
    // Loop over the content body pages and remove the active-page class(primarily reverts the page to display:none)
    const pages = contentBody.children;
    for (let i = 0; i < pages.length; i++) {
        pages[i].classList.add('page-hider');
    }
}

function switchPage(page = 0) {
    deactivateActiveNav();
    deactivateActiveContentPage();
    // 0 - chats-body, 1 contacts-body. Adds class 'active-page' to desire page, so it becomes visible along with it's nav pointer
    if (page === 0) {
        chatsPagePointer.classList.add('active-nav');
        chatsPage.classList.remove('page-hider');
    } else if (page === 1) {
        contactsPagePointer.classList.add('active-nav');
        contactsPage.classList.remove('page-hider');
    }
}

chatsPagePointer.addEventListener('click', () => switchPage(0));
contactsPagePointer.addEventListener('click', () => switchPage(1));

function sendMessageToAnotherUser(recipientHandle, message) {
    if (message.length > 0) {
        // eslint-disable-next-line no-undef
        sendMessage(JSON.stringify({
            recipient: recipientHandle,
            message,
        }));
    }
}

function activateChatPage(userHandle) {
    if (userHandle.length > 1) {
        const chatPage = document.getElementById('active-user-chat-page');
        chatPage.style.display = 'block';

        document.getElementById('user-handle').innerHTML = `( @${userHandle} )`;
        const messageInput = document.getElementById('message-input');
        document.getElementById('message-send').onclick = () => {
            sendMessageToAnotherUser(userHandle, messageInput.value);
            messageInput.value = '';
        };
    }
}

const allActiveChats = document.getElementsByClassName('active-chats');

for (const activeChat of allActiveChats) {
    activeChat.addEventListener('click', () => {
        activateChatPage(activeChat.getAttribute('data-user-handle-tag'));
    });
}

function deactivateChatPage() {
    document.getElementById('active-user-chat-page').style.display = 'none';
}

document.getElementById('exit-active-user-chat-page-btn').addEventListener('click', deactivateChatPage);
// Function to handle the input change event
function handleInputChange(event) {
    const inputValue = event.target.value;

    // Check if the input value is not empty
    if (inputValue.trim()) {
        // Send the input value to the user_search.php script using AJAX
        const xhr = new XMLHttpRequest();
        const url = 'http://localhost/signal_chat_app/backend_app_service/functions/user_search.php?handle_tag=' + inputValue;
        xhr.open('GET', url, true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                // Parse the response and generate elements or show 'No users found'
                let response = null;
                try {
                    response = JSON.parse(xhr.responseText);
                } catch {
                    console.log('Error decoding server response, most likely server error has occured');
                    return false;
                }

                const resultsContainer = document.getElementById('contacts-sub-page');
                resultsContainer.innerHTML = ''; // Clear previous results

                if (response.length === 0) {
                    const noUsersElement = document.createElement('div');
                    noUsersElement.textContent = 'No users found';
                    resultsContainer.appendChild(noUsersElement);
                } else {
                    // Loop through the search results and generate elements
                    response.forEach(user => {
                        const userElement = document.createElement('div');
                        userElement.className = 'contact';
                        userElement.innerHTML = `
                            <div class='user-name' onclick='activateChatPage("${user.handle_tag}")'>
                                <span class='user-first-name'>${user.first_name}</span>
                                <span class='user-last-name'>${user.last_name}</span>
                                <span class='user-handle'>( ${user.handle_tag} )</span>
                            </div>
                        `;
                        resultsContainer.appendChild(userElement);
                    });
                }
            }
        };

        xhr.send();
    } else {
        // If the input is empty, clear the search results
        document.getElementById('contacts-sub-page').innerHTML = '';
    }
}

// Attach the handleInputChange function to the input element's input event
document.getElementById('user-search-input').addEventListener('input', handleInputChange);

