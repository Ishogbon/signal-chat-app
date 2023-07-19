const chatModule = {
    readChats: [],
    unreadChats: [],
    loadChats() {
        this.readChats = localStorage.getItem('readChats');
        this.unreadChats = localStorage.getItem('unreadChats');
    },
    saveChats() {
        localStorage.setItem('readChats', this.readChats);
        localStorage.setItem('unreadChats', this.unreadChats);
    },
};

chatModule.loadChats();
