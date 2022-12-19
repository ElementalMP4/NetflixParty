"use strict";

var Globals = {
    LastMessageAuthor: "",
    RoomColour: "",
    RoomID: "",
    Gateway: {},
    ChatReady: false,
    TypingCount: 0,
    IsTyping: false,
    ControlFreezer: {
        ControlsFrozen: false,
        ControlFreezeTimer: {}
    },
    Menu: {
        Modal: {},
        CloseButton: {}
    }
};

const ConsoleColour = {
    Green: "\x1b[32m",
    Red: "\x1b[31m",
    Yellow: "\x1b[33m",
    Blue: "\x1b[34m",
    Reset: "\x1b[0m"
};

const RESOURCE_URL = "netflixparty.voidtech.de"; //Make sure this URL has no protocol. Just the domain.

Globals.Gateway = new WebSocket("wss://" + RESOURCE_URL + "/gateway");

function LogMessage(...message) {
    console.log(ConsoleColour.Red + "[NetflixParty]" + ConsoleColour.Reset, ...message);
}

function controlsFrozen() {
    return Globals.ControlFreezer.ControlsFrozen;
}

function freezeControls() {
    LogMessage("Controls frozen");
    Globals.ControlFreezer.ControlsFrozen = true;
    Globals.ControlFreezer.ControlFreezeTimer = setTimeout(() => {
        Globals.ControlFreezer.ControlsFrozen = false;
        LogMessage("Controls unfrozen");
    }, 500);
}

function hideModal() {
    Globals.Menu.Modal.style.display = "none";
}

function showModalMenu() {
    Globals.Menu.Modal.style.display = "block";
}

function sendGatewayMessage(message) {
    LogMessage("Sent", message);
    if (Globals.Gateway.readyState == Globals.Gateway.OPEN) Globals.Gateway.send(JSON.stringify(message));
}

function getDefault(value) {
    switch (value) {
        case "username":
            return "Netflix Party User";
        case "colour":
            return "#FF0000";
        case "avatar":
            return "default";
    }
}

function getStoredValue(value) {
    const storedVal = localStorage.getItem(value);
    return storedVal == null ? getDefault(value) : storedVal;
}

function showTypingMessage() {
    document.getElementById("typing-message").style.display = "block";
}

function hideTypingMessage() {
    document.getElementById("typing-message").style.display = "none";
}

function updateTyping(data) {
    if (data.user == getStoredValue("username")) return;
    if (data.mode == "start") Globals.TypingCount = Globals.TypingCount + 1;
    else Globals.TypingCount = Globals.TypingCount - 1;

    if (Globals.TypingCount > 0) showTypingMessage();
    else hideTypingMessage();
};

function saveValue(valueName, value) {
    localStorage.setItem(valueName, value);
}

function initialiseParty() {
    LogMessage("Source has been injected");
    //Used for debugging
    window.NetflixParty = Globals;
    connectToParty();
}

function addChatMessage(data) {
    if (!Globals.ChatReady) return;
    const author = data.author;
    const colour = data.colour;
    const content = data.content;
    const modifiers = data.modifiers !== "" ? `class="${data.modifiers}"` : "";
    const avatar = data.avatar;

    let newMessage = `<div class="chat-message">`;
    if (Globals.LastMessageAuthor !== author) {
        newMessage += `<img class="user-image" src="${"https://" + RESOURCE_URL + "/avatar/" + avatar}">`;
        newMessage += `<p class="msg-nickname" style="color:${colour}">${author}</p><br>`;
    }
    newMessage += `<p ${modifiers}>${content}</p></div>`;
    if (Globals.LastMessageAuthor !== author) newMessage += "<br>";

    Globals.LastMessageAuthor = author;

    let chatHistory = document.getElementById("chat-history");
    chatHistory.insertAdjacentHTML('afterbegin', newMessage);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function displayLocalMessage(message) {
    addChatMessage({ "author": "System", "colour": Globals.RoomColour, "content": message, "modifiers": "system", "avatar": "default" });
}

function setAvatarUrl(avatar) {
    document.getElementById("avatar-preview").src = "https://" + RESOURCE_URL + "/avatar/" + avatar;
}

function attachMenuListeners() {
    Globals.Menu.CloseButton = document.getElementById("close");
    Globals.Menu.Modal = document.getElementById("modal");

    Globals.Menu.CloseButton.onclick = function() {
        hideModal();
    }

    window.onclick = function(event) {
        if (event.target == Globals.Menu.Modal) {
            hideModal();
        }
    }

    document.addEventListener("keydown", function(event) {
        if (event.code == "Escape") {
            hideModal();
        }
    });

    document.getElementById("avatar-input").onchange = function() {
        setAvatarUrl(document.getElementById("avatar-input").value);
    }

    document.getElementById("save-button").onclick = function() {
        let nickname = document.getElementById("nickname-input").value;
        let colour = document.getElementById("colour-input").value;
        let avatar = document.getElementById("avatar-input").value;
        saveValue("username", nickname);
        saveValue("colour", colour);
        saveValue("avatar", avatar);
        displayLocalMessage("Settings updated!");
    };

    window.addEventListener("keydown", function(event) {
        if (event.code == "KeyI" && event.ctrlKey && !event.shiftKey) {
            document.getElementById("nickname-input").value = getStoredValue("username");
            document.getElementById("colour-input").value = getStoredValue("colour");
            document.getElementById("avatar-input").value = getStoredValue("avatar");
            setAvatarUrl(getStoredValue("avatar"));
            showModalMenu();
        }
    });
}

function attachChatListeners() {
    document.getElementById("chat-input").addEventListener("keyup", handleChatEvent);
    document.getElementById("chat-input").addEventListener("blur", handleChatBlurEvent);

    window.addEventListener("click", event => {
        if (event.target.id == "chat-input") document.getElementById("chat-input").focus();
        else document.getElementById("chat-input").blur();
    });
}

//This function is a mess, but it works. Never ever ever touch this 
function injectPage() {
    //Add fonts
    document.head.insertAdjacentHTML("beforeend", `
            <link href="https://fonts.googleapis.com/css2?family=Lobster+Two&display=swap" rel="stylesheet">
            <link href="https://fonts.googleapis.com/css2?family=Paytone+One&display=swap" rel="stylesheet">
        `);
    document.body.insertAdjacentHTML("afterbegin", `
        <div id="modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <span id="close" class="close">&times;</span>
                    <h2 id="modal-title">User Settings</h2>
                </div>
                <div class="modal-body">
                    <div class="modal-item">
                        <p>Set your nickname</p><br>
                        <input type="text" id="nickname-input" placeholder="Enter a nickname"><br><br>
                    </div>
                    <div class="modal-item">
                        <p>Change your nickname colour</p><br>
                        <input type="color" id="colour-input" value="#ff0000"><br><br>
                    </div>
                    <div class="modal-item">
                        <img src="https://${RESOURCE_URL}/avatar/default" id="avatar-preview" class="avatar-preview">
                        <br>
                        <label for="avatar-options" class="">Choose an avatar:</label><br><br>
                        <select name="avatar-options" id="avatar-input">
                            <option value="beagle">Beagle</option>
                            <option value="bernese">Bernese</option>
                            <option value="bichon">Bichon</option>
                            <option value="birb">Birb</option>
                            <option value="corgi">Corgi</option>
                            <option value="hedgehog">Hedgehog</option>
                            <option value="maincoon">Maincoon</option>
                            <option value="mutt">Mutt</option>
                            <option value="otter">Otter</option>
                            <option value="persian">Persian</option>
                            <option value="pom">Pom</option>
                            <option value="pug">Pug</option>
                            <option value="quokka">Quokka</option>
                            <option value="siamese">Siamese</option>
                            <option value="sloth">Sloth</option>
                            <option value="tabby">Tabby</option>
                            <option value="toad">Toad</option>
                            <option value="tuxedo">Tuxedo</option>
                        </select>
                    </div>
                    <div class="modal-item">
                        <button class="np-button" id="save-button"><p>Save your settings</p></button><br><br>
                    </div>
                </div>
            </div>
        </div>`);
    //Re-format the netflix player
    let videoDiv = document.querySelector("#appMountPoint > div > div > div.watch-video > div");
    videoDiv.style.display = "inline-block";
    videoDiv.style.width = "80%"
    videoDiv.style.float = "left";
    //Add our chat
    videoDiv.insertAdjacentHTML("afterend", `<div id="chat"></div>`);
    let chat = document.getElementById("chat");
    chat.style.height = "100%"
    chat.style.width = "20%";
    chat.style.float = "right";
    //Add the chat history
    let chatHistory = document.createElement("div");
    chatHistory.classList.add("chat");
    chatHistory.id = "chat-history";
    chat.appendChild(chatHistory);
    //Add the chat controls
    chat.insertAdjacentHTML("beforeend", `
            <br><input type="text" id="chat-input" placeholder="Enter a message" autocomplete="off">
            <p class="typing-message typing" id="typing-message"><span>•</span><span>•</span><span>•</span> People are typing</p>
        `);
    //Make the typing thingy go away
    hideTypingMessage();
    Globals.ChatReady = true;
    //Add some more listeners
    attachMenuListeners();
    attachChatListeners();
    //We are ready for business
    LogMessage("NetflixParty is ready for business");
    displayLocalMessage("Press ctrl+i to open the user menu and customise your profile!");
}

function speakMessage(message) {
    let tts = new SpeechSynthesisUtterance();
    tts.text = message;
    window.speechSynthesis.speak(tts);
}

function handleChatMessage(data) {
    if (data.modifiers.includes("tts")) speakMessage(data.content);
    addChatMessage(data);
}

Globals.Gateway.onopen = function() {
    LogMessage("Gateway Connected");
};

Globals.Gateway.onclose = function() {
    LogMessage("Gateway Disconnected")
};

Globals.Gateway.onmessage = function(msg) {
    const message = JSON.parse(msg.data);
    LogMessage("Received", message);
    switch (message.type) {
        case "join-party":
            if (message.success) {
                Globals.RoomColour = message.response.theme;
                injectPage();
            }
            break;
        case "chat-message":
            handleChatMessage(message.data);
            break;
        case "pause-video":
            pause();
            break;
        case "play-video":
            playAtTime(message.data.time);
            break;
        case "system-ping":
            displayLocalMessage("API response time: " + (new Date().getTime() - message.response.start) + "ms");
            break;
        case "typing-update":
            updateTyping(message.data);
            break;
    }
}

function handleHelpCommand() {
    displayLocalMessage(`Chat Command Help:<br>
/help - shows this message<br>
/i [message] - changes your message to italics<br>
/u [message] - changes your message to underline<br>
/b [message] - makes your message bold<br>
/s [message] - changes your message to strikethrough<br>
/c [message] - changes your message to cursive<br>
/cc [message] - cHaNgEs YoUr TeXt LiKe ThIs<br>
/big [message] - makes your message big<br>
/r - reloads your session<br>
/tts - send a text-to-speech message<br>
/ping - get the API response time`);
}

function toCrazyCase(body) {
    let toUpper = Math.round(Math.random()) == 1 ? true : false;
    let messageLetters = body.split("");
    let final = "";

    for (let i = 0; i < messageLetters.length; i++) {
        if (messageLetters[i].replace(/[A-Za-z]+/g, " ") !== "") {
            if (toUpper) final += messageLetters[i].toLowerCase();
            else final += messageLetters[i].toUpperCase();
            toUpper = !toUpper;
        } else final += messageLetters[i];
    }
    return final;
}

function handlePingCommand() {
    let requestData = {
        "type": "system-ping",
        "data": {
            "start": new Date().getTime()
        }
    }
    sendGatewayMessage(requestData);
}

function sendTypingStop() {
    if (Globals.IsTyping) {
        Globals.IsTyping = false;
        sendGatewayMessage({ "type": "typing-update", "data": { "mode": "stop", "user": getStoredValue("username"), "roomID": Globals.RoomID } });
    }
}

function sendTypingStart() {
    if (!Globals.IsTyping) {
        Globals.IsTyping = true;
        sendGatewayMessage({ "type": "typing-update", "data": { "mode": "start", "user": getStoredValue("username"), "roomID": Globals.RoomID } });
    }
}

function handleChatBlurEvent(event) {
    if (event.relatedTarget !== null) event.target.focus();
}

function handleChatEvent(event) {
    if (event.key == "Enter") {
        sendTypingStop();
        event.preventDefault();
        let message = document.getElementById("chat-input").value.trim();
        if (message == "") return;
        if (message.length > 2000) {
            displayLocalMessage("Your message is too long! Messages cannot be longer than 2000 characters.");
            return;
        }

        let sendChatMessage = true;
        let modifiers = "";

        if (message.startsWith("/")) {
            const args = message.slice(1).split(/ +/);
            const command = args.shift().toLowerCase();

            switch (command) {
                case "help":
                    handleHelpCommand();
                    sendChatMessage = false;
                    break;
                case "cc":
                    message = toCrazyCase(args.join(" "));
                    break;
                case "i":
                    modifiers = "italic";
                    message = args.join(" ");
                    break;
                case "u":
                    modifiers = "underline";
                    message = args.join(" ");
                    break;
                case "b":
                    modifiers = "bold";
                    message = args.join(" ");
                    break;
                case "s":
                    modifiers = "strikethrough";
                    message = args.join(" ");
                    break;
                case "c":
                    modifiers = "cursive";
                    message = args.join(" ");
                    break;
                case "big":
                    modifiers = "big";
                    message = args.join(" ");
                    break;
                case "r":
                    sendChatMessage = false;
                    location.reload();
                    break;
                case "tts":
                    modifiers = "tts";
                    message = args.join(" ");
                    break;
                case "ping":
                    handlePingCommand();
                    sendChatMessage = false;
                    break;
            }
        }
        if (sendChatMessage) {
            sendGatewayMessage({
                "type": "chat-message",
                "data": {
                    "roomID": Globals.RoomID,
                    "content": message,
                    "colour": getStoredValue("colour"),
                    "author": getStoredValue("username"),
                    "avatar": getStoredValue("avatar"),
                    "modifiers": modifiers
                }
            });
        }
        document.getElementById("chat-input").value = "";
    } else {
        let message = document.getElementById("chat-input").value.trim();
        if (message == "") sendTypingStop();
        else sendTypingStart();
    }
}


const url = new URL(location.href);
if (url.searchParams.has("roomID")) {
    console.log("%cNetflixParty", "color: red; font-weight: bold; font-size: 60px; -webkit-text-stroke-width: 2px; -webkit-text-stroke-color: black;");
    console.log("NetflixParty is getting ready...");
    Globals.RoomID = url.searchParams.get("roomID");
    initialiseParty();
}