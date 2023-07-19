const socket = new WebSocket('ws://localhost:8080/chatserver/chat_endpoint');

socket.onopen = function () {
    if (socket.readyState === WebSocket.OPEN) {
        console.log('Server\'s websocket has successfully been connected to');
    }
};

socket.onmessage = function (event) {
    console.log(`[message] Data received from server: ${event.data}`);
};

socket.onclose = function (event) {
    if (event.wasClean) {
        console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
    // E.g. server process killed or network down
    // event.code is usually 1006 in this case
        console.log('[close] Connection died');
    }
};

socket.onerror = function (error) {
    console.log(error);
};

// eslint-disable-next-line no-unused-vars
function sendMessage(message) {
    console.log(message);
    socket.send(message);
}
