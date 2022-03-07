"unsafe-inline";

function showMessage(message) {
    document.getElementById("message").style.display = "block";
    document.getElementById("subtitle").style.display = "none";
    document.getElementById("message").innerHTML = message;
}

const GatewayServerURL = "wss://netflixparty.voidtech.de/gateway"
var Gateway = new WebSocket(GatewayServerURL);

Gateway.onopen = function() {
    console.log("Connected To Gateway");
}

Gateway.onclose = function() {
    console.log("Connection Lost");
}

function closePage() {
    window.close();
}

function reloadWithRoomID(roomID) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var tab = tabs[0];
        let url = new URL(tab.url);
        if (url.searchParams.has("roomID")) url.searchParams.set("roomID", roomID);
        else url.searchParams.append("roomID", roomID);
        chrome.tabs.create({ url: url.toString() });
        chrome.tabs.remove(tab.id);
    });
}

Gateway.onmessage = function(message) {
    const response = JSON.parse(message.data);
    console.log(response);
    if (response.success) reloadWithRoomID(response.response.roomID);
    else showMessage("Error: " + response.response);
}

function createRoom() {
    const theme = document.getElementById("room-colour-picker").value;
    const payload = {
        "type": "create-party",
        "data": {
            "theme": theme
        }
    }
    Gateway.send(JSON.stringify(payload));
}

document.getElementById("create-button").addEventListener("click", createRoom);