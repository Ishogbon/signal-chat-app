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
