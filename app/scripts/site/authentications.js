class AjaxRequest {
    constructor() {
        this.xhr = new XMLHttpRequest();
    }

    sendRequest(url, method, successCallback, errorCallback, params = {}) {
        const paramString = this.serializeParams(params);
        const requestUrl = method === 'GET' ? `${url}?${paramString}` : url;

        this.xhr.open(method, requestUrl, true);

        this.xhr.onload = function () {
            if (this.xhr.status >= 200 && this.xhr.status < 400) {
            // Success callback for 2xx status codes
                successCallback(this.xhr.responseText);
            } else {
            // Error callback for other status codes
                errorCallback(this.xhr.statusText);
            }
        }.bind(this);

        this.xhr.onerror = function () {
            errorCallback('An error occurred during the request.');
        };

        if (method === 'POST') {
            this.xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }

        this.xhr.send(method === 'POST' ? paramString : null);
    }

    serializeParams(params) {
        const keys = Object.keys(params);
        if (keys.length === 0) {
            return '';
        }

        const paramList = keys.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
        return `${paramList.join('&')}`;
    }
}

function processError(errorText) {
    const errorBar = document.getElementById('form-error-bar');
    errorBar.style.display = 'block';
    errorBar.innerHTML = errorText;
    setTimeout(() => {
        errorBar.style.display = 'none';
    }, 4000);
}

function processSuccessResponse(response) {
    if (response === '1') {
        window.location.replace('http://localhost/signal_chat_app/app/application.php');
    } else {
        processError(response);
    }
}

function processFailedResponse(response) {
    processError(response);
}

function processRegistration(event) {
    event.preventDefault();

    const form = document.getElementById('registration-form');
    const formData = new FormData(form);
    const params = Object.fromEntries(formData);

    const ajx = new AjaxRequest();
    ajx.sendRequest('http://localhost/signal_chat_app/backend_app_service/authentication/registration.php', 'POST', processSuccessResponse, processFailedResponse, params);
}

function processLogin(event) {
    event.preventDefault();

    const form = document.getElementById('login-form');
    const formData = new FormData(form);
    const params = Object.fromEntries(formData);

    const ajx = new AjaxRequest();
    ajx.sendRequest('http://localhost/signal_chat_app/backend_app_service/authentication/login.php', 'POST', processSuccessResponse, processFailedResponse, params);
}

if (document.getElementById('registration-form')) {
    const form = document.getElementById('registration-form');
    form.addEventListener('submit', processRegistration);
}

if (document.getElementById('login-form')) {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', processLogin);
}
