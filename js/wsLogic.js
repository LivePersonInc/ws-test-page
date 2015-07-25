var ws;
var logContainer;
var historyContainer;
var messagesHistory = [];
function connectToServer() {
    var icon = document.getElementById("connection_error_icon");

    try {
        ws = new WebSocket(document.getElementById("serverSelected").value);
        document.getElementById("connectionStatus").innerHTML = "Connecting";

        ws.onopen = function () {
            document.getElementById("connectionStatus").innerHTML = "Connected";
        };
        ws.onmessage = function (event) {
            createLogLine(event.data);
        };
        ws.onclose = function () {
            document.getElementById("connectionStatus").innerHTML = "Disconnected";
        };
        icon.style.visibility = "hidden";
        icon.title = '';
    } catch (e) {
        icon.style.visibility = "visible";
        icon.title = e.message;
    }
}

function storeHistory() {
    if (messagesHistory && messagesHistory.length >= 100) {
        messagesHistory = messagesHistory.slice(0, 100)
    }
    localStorage.setItem("history", JSON.stringify(messagesHistory));
}

function getHistory() {
    var his = localStorage.getItem("history");
    if (his) {
        try {
            his = JSON.parse(his);
            messagesHistory = his;
        } catch (exc) {
        }
    }
}

function clearLog() {
    if (!logContainer) {
        logContainer = document.getElementById("responseFromServer");
    }
    while (logContainer.firstChild) {
        logContainer.removeChild(logContainer.firstChild);
    }
}

function createLogLine(msg) {
    var date = new Date();
    var logLine = document.createElement("li");
    logLine.innerHTML = date.getHours() + ":" + getInTwoDigits(date.getMinutes()) + ":" + getInTwoDigits(date.getSeconds()) + " : " + formatMessage(msg);
    logLine.className = 'list-group-item';
    appendLogLine(logLine);
}

function appendLogLine(line) {
    if (!logContainer) {
        logContainer = document.getElementById("responseFromServer");
    }
    if (logContainer.hasChildNodes()) {
        logContainer.insertBefore(line, logContainer.firstChild);
    } else {
        logContainer.appendChild(line);
    }
}

function createHistoryLine(msg) {
    if (!msg.date) {
        msg.date = new Date();
    }
    else if (typeof msg.date === "string") {
        msg.date = new Date(msg.date);
    }
    var logLine = document.createElement("li");
    var data = "<div>Time: <span>" + msg.date.toLocaleString() + "</span></div>\
            <div>URL: <span>" + msg.url + "</span></div>\
            <div>message: <span>" + msg.message + "</span></div>";
    logLine.innerHTML = data;
    logLine.onclick = function () {
        historySelect(msg);
    };
    logLine.className = 'list-group-item';
    appendHistoryLine(logLine);
}

function appendHistoryLine(line) {
    if (!historyContainer) {
        historyContainer = document.getElementById("historyContainer");
    }
    if (historyContainer.hasChildNodes()) {
        historyContainer.insertBefore(line, historyContainer.firstChild);
    } else {
        historyContainer.appendChild(line);
    }
}

function formatMessage(msg) {
    if (typeof msg === "object") {
        return JSON.stringify(msg);
    }
    return msg;
}

function getInTwoDigits(num) {
    return num < 10 ? '0' + num : '' + num;
}

function disconnectToServer() {
    ws.close();
}
function sendMessage() {
    var icon = document.getElementById("error_icon");
    try {
        var msgObj = document.getElementById("msgToServer").value;
        ws.send(msgObj);
        icon.style.visibility = "hidden";
        icon.title = '';

        var historyLine = {
            url: document.getElementById("serverSelected").value,
            message: document.getElementById("msgToServer").value,
            date: new Date()
        };
        messagesHistory.unshift(historyLine);
        createHistoryLine(historyLine);
        storeHistory();

    } catch (e) {
        icon.style.visibility = "visible";
        icon.title = e.message;
    }
}

function historySelect(msg) {
    document.getElementById("serverSelected").value = msg.url;
    document.getElementById("msgToServer").value = msg.message;
}

function loadHistory() {
    getHistory();
    if (messagesHistory && messagesHistory.length) {
        for (var i = messagesHistory.length - 1; i >= 0; i--) {
            createHistoryLine(messagesHistory[i]);
        }
    }
}