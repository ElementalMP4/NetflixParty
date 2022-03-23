function NetflixPartyEmbeddedSource() {
    var Globals = {
        LAST_MESSAGE_AUTHOR: "",
        ROOM_COLOUR: "",
        ROOM_ID: "",
        SESSION_ID: "",
        GATEWAY: {},
        GET_PLAYER: {},
        CHAT_READY: false,
        TYPING_COUNT: 0,
        TYPING: false
    };

    const RESOURCE_URL = "netflixparty.voidtech.de"; //Make sure this URL has no protocol. Just the domain.

    Globals.GATEWAY = new WebSocket("wss://" + RESOURCE_URL + "/gateway");

    function getVideoPlayer() {
        var e = window.netflix.appContext.state.playerApp.getAPI().videoPlayer,
            t = e.getAllPlayerSessionIds().find((val => val.includes("watch")));
        return e.getVideoPlayerBySessionId(t);
    };

    const STYLESHEET_RULES = `
    input[type=text] {
        color: white;
        background-color: #292929;
        border: none;
        border-bottom: 2px solid grey;
        outline: none;
        width: 100%;
        float: left;
        font-size: 14px;
    }
    
    input[type=text]:focus {
        border-bottom: 2px solid #8f2727
    }
    .chat {
        height: 91%;
        overflow-y: scroll;
        overflow-x: hidden;
        overflow: auto;
        display: flex;
        flex-direction: column-reverse;
        background-color: #1a1a1a;
        overflow-wrap: break-word;
        white-space: pre-wrap;
        position: relative;
    }
    
    .chat-message {
        background-color: #212121;
        border-radius: 5px;
        animation: slide-up 0.4s ease;
        padding: 3px;
    }
    
    .chat-message:hover {
        background-color: #292929;
    }
    
    p {
        color: white;
        font-family: Helvetica;
        font-size: 14px;
        display: inline;
    }
    
    p.msg-nickname {
        font-size: 16px;
        font-family: 'Paytone One', sans-serif;
        vertical-align: middle;
        overflow-wrap: break-word;
        display: inline;
    }
    
    img.user-image {
        border-radius: 50%;
        height: 30px;
        width: 30px;
        vertical-align: middle;
        padding-right: 5px;
        display: inline;
    }
    ::-webkit-scrollbar {
        width: 5px;
    }
    
     ::-webkit-scrollbar-thumb {
        background: #ab1400;
        border-radius: 10px;
    }
    
     ::-webkit-scrollbar-thumb:hover {
        background: red;
    }
    p.typing-message {
        padding: 0%;
        color: grey;
        font-style: italic;
    }
    
    p.system {
        color: grey;
        font-style: italic;
    }
    
    p.italic {
        font-style: italic;
    }
    
    p.bold {
        font-weight: bold;
    }
    
    p.underline {
        text-decoration: underline;
    }
    
    p.strikethrough {
        text-decoration: line-through;
    }
    
    p.cursive {
        font-family: 'Lobster Two', cursive;
        font-size: 20nopx;
    }
    
    p.big {
        font-size: 35px;
    }
    
    @keyframes blink {
        0% {
            opacity: .2;
        }
        20% {
            opacity: 1;
        }
        100% {
            opacity: .2;
        }
    }
    
    .typing span {
        animation-name: blink;
        animation-duration: 1.4s;
        animation-iteration-count: infinite;
        animation-fill-mode: both;
    }
    
    .typing span:nth-child(2) {
        animation-delay: .2s;
    }
    
    .typing span:nth-child(3) {
        animation-delay: .4s;
    }

    .modal {
        display: none;
        position: fixed;
        z-index: 1;
        padding-top: 100px;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0, 0, 0, 0.4);
        border: none;
    }
    
    .modal-content {
        position: relative;
        background-color: #1a1a1a;
        margin: auto;
        padding: 0;
        width: 80%;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
        -webkit-animation-name: animatetop;
        -webkit-animation-duration: 0.4s;
        animation-name: animatetop;
        animation-duration: 0.4s;
    }
    
    @keyframes animatetop {
        from {
            top: -300px;
            opacity: 0
        }
        to {
            top: 0;
            opacity: 1
        }
    }
    
    .close {
        color: white;
        float: right;
        font-size: 28px;
        font-weight: bold;
    }
    
    .close:hover,
    .close:focus {
        color: #000;
        text-decoration: none;
        cursor: pointer;
    }
    
    .modal-header {
        padding: 2px 16px;
        background-color: #ff0000;
        color: white;
    }
    
    .modal-body {
        padding: 2px 16px;
        align-items: center;
        text-align: center;
    }

    .modal-item {
        margin: auto;
        padding: 5px;
        width: 50%;
    }
    
    p,
    h2 {
        color: white;
        font-family: Arial, Helvetica, sans-serif;
        line-height: 1.5;
    }

    input[type=color] {
        margin: auto;
        width: 100%;
        border-radius: 10px;
    }

    button {
        color: white;
        background-color: #960303;
        border: none;
        border-radius: 50px;
        display: block;
        margin: auto;
        width: 100%;
    }
    
    button:hover {
        background-color: #d80000;
    }

    img.avatar-preview {
        border-radius: 50%;
        height: 150px;
        width: 150px;
    }

    select {
        background-color: #111111;
        border: solid 2px grey;
        border-radius: 50px;
        display: block;
        margin: auto;
        padding: 15px;
        outline: none;
        box-sizing: border-box;
        color: white;
        width: 100%;
    }
    `;

    let modal;
    let closeButton;

    function hideModal() {
        modal.style.display = "none";
    }

    function showModalMenu() {
        modal.style.display = "block";
    }

    console.log("Netflix Party - Better than Teleparty");

    function sendGatewayMessage(message) {
        console.log("Sent", message);
        if (Globals.GATEWAY.readyState == Globals.GATEWAY.OPEN) Globals.GATEWAY.send(JSON.stringify(message));
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
        if (data.mode == "start") Globals.TYPING_COUNT = Globals.TYPING_COUNT + 1;
        else Globals.TYPING_COUNT = Globals.TYPING_COUNT - 1;

        if (Globals.TYPING_COUNT > 0) showTypingMessage();
        else hideTypingMessage();
    };

    function saveValue(valueName, value) {
        localStorage.setItem(valueName, value);
    }

    function pause() {
        if (getVideoPlayer().isPaused()) console.log("Ignoring pause event");
        else {
            console.log("Automated pause event fired");
            getVideoPlayer().pause();
        }
    }

    function playAtTime(time) {
        if (getVideoPlayer().isPlaying()) console.log("Ignoring play event");
        else {
            console.log("Automated play event fired");
            getVideoPlayer().seek(time);
            getVideoPlayer().play();
        }
    }

    function handlePlayEvent() {
        console.log("Playing at " + getVideoPlayer().getCurrentTime());
        displayLocalMessage("Video Playing at " + getVideoPlayer().getCurrentTime());
        sendGatewayMessage({ "type": "play-video", "data": { "timestamp": getVideoPlayer().getCurrentTime(), "roomID": Globals.ROOM_ID } });
    }

    function handlePauseEvent() {
        console.log("Paused");
        displayLocalMessage("Video Paused");
        sendGatewayMessage({ "type": "pause-video", "data": { "roomID": Globals.ROOM_ID } });
    }

    function connectToParty() {
        sendGatewayMessage({ "type": "join-party", "data": { "roomID": Globals.ROOM_ID, "username": getStoredValue("username") } });
    }

    function actuallyAddListeners() {
        let video = document.getElementsByTagName("video")[0];
        try {
            video.onpause = function() { handlePauseEvent() };
        } catch (error) {
            console.error(error);
            console.log("Could not change pause listener. This is not fine.");
        }

        try {
            video.onplay = function() { handlePlayEvent() };
        } catch (error) {
            console.error(error);
            console.log("Could not change play listener. This is not fine.");
        }

        //We observe the video element to see if the SRC value changes. If it does, we know that a new video has been set and we need to
        //re attach our listeners so we can detect pause/play events.
        observer = new MutationObserver((changes) => {
            changes.forEach(change => {
                if (change.attributeName.includes('src')) {
                    console.log("Video SRC change detected. Reattaching listeners");
                    actuallyAddListeners();
                }
            });
        });
        observer.observe(video, { attributes: true });
    }

    function addListeners() {
        console.log("Attempting to add listeners...");
        let player = getVideoPlayer();
        if (player != undefined && document.getElementsByTagName("video")[0] != undefined) {
            if (player.isReady()) {
                console.log("Adding listeners!");
                actuallyAddListeners();
                injectPage();
            } else {
                console.log("Player not ready! Waiting before next listener attempt");
                setTimeout(addListeners, 1000);
            }
        } else {
            console.log("Player undefined! Waiting before next listener attempt");
            setTimeout(addListeners, 1000);
        }
    }

    function initialiseParty() {
        console.log("NETFLIX PARTY EMBEDDED");
        Globals.GET_PLAYER = getVideoPlayer;
        window.NetflixParty = Globals;
        addListeners();
    }

    function addChatMessage(data) {
        if (!Globals.CHAT_READY) return;
        const author = data.author;
        const colour = data.colour;
        const content = data.content;
        const modifiers = data.modifiers !== "" ? `class="${data.modifiers}"` : "";
        const avatar = data.avatar;

        let newMessage = `<div class="chat-message">`;
        if (Globals.LAST_MESSAGE_AUTHOR !== author) {
            newMessage += `<img class="user-image" src="${modifiers.includes("system") ? avatar : ("https://" + RESOURCE_URL + "/avatar/" + avatar)}">`;
            newMessage += `<p class="msg-nickname" style="color:${colour}">${author}</p><br>`;
        }
        newMessage += `<p ${modifiers}>${content}</p></div>`;
        if (Globals.LAST_MESSAGE_AUTHOR !== author) newMessage += "<br>";

        Globals.LAST_MESSAGE_AUTHOR = author;

        let chatHistory = document.getElementById("chat-history");
        chatHistory.insertAdjacentHTML('afterbegin', newMessage);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function displayLocalMessage(message) {
        addChatMessage({ "author": "System", "colour": Globals.ROOM_COLOUR, "content": message, "modifiers": "system", "avatar": "https://" + RESOURCE_URL + "/avatar/default" });
    }

    function setAvatarUrl(avatar) {
        document.getElementById("avatar-preview").src = "https://" + RESOURCE_URL + "/avatar/" + avatar;
    }

    function attachMenuListeners() {
        closeButton = document.getElementById("close");
        modal = document.getElementById("modal");

        closeButton.onclick = function() {
            hideModal();
        }

        window.onclick = function(event) {
            if (event.target == modal) {
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
            if (event.code == "KeyI" && event.ctrlKey) {
                document.getElementById("nickname-input").value = getStoredValue("username");
                document.getElementById("colour-input").value = getStoredValue("colour");
                document.getElementById("avatar-input").value = getStoredValue("avatar");
                setAvatarUrl(getStoredValue("avatar"));
                showModalMenu();
            }
        });
    }

    function injectPage() {
        //Add stylesheet
        let stylesheet = document.createElement("style");
        stylesheet.innerText = STYLESHEET_RULES;
        document.head.appendChild(stylesheet);
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
                        <button id="save-button"><p>Save your settings</p></button><br><br>
                    </div>
                </div>
            </div>
        </div>`)
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
        Globals.CHAT_READY = true;
        //Chat Listeners
        document.getElementById("chat-input").addEventListener("keyup", handleChatEvent);
        document.getElementById("chat-input").addEventListener("blur", handleChatBlurEvent);

        window.addEventListener("click", event => {
            if (event.target.id == "chat-input") {
                document.getElementById("chat-input").focus();
            } else {
                document.getElementById("chat-input").blur();
            }
        })

        //Menu listeners
        attachMenuListeners();
        //We are ready for business
        connectToParty();
        pause();
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

    Globals.GATEWAY.onopen = function() {
        console.log("Gateway Connected");
    };

    Globals.GATEWAY.onclose = function() {
        console.log("Gateway Disconnected")
    };

    Globals.GATEWAY.onmessage = function(msg) {
        const message = JSON.parse(msg.data);
        console.log("Received", message);
        switch (message.type) {
            case "join-party":
                if (message.success) Globals.ROOM_COLOUR = message.response.theme;
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
        if (Globals.TYPING) {
            Globals.TYPING = false;
            sendGatewayMessage({ "type": "typing-update", "data": { "mode": "stop", "user": getStoredValue("username"), "roomID": Globals.ROOM_ID } });
        }
    }

    function sendTypingStart() {
        if (!Globals.TYPING) {
            Globals.TYPING = true;
            sendGatewayMessage({ "type": "typing-update", "data": { "mode": "start", "user": getStoredValue("username"), "roomID": Globals.ROOM_ID } });
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
                        "roomID": Globals.ROOM_ID,
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

    let url = new URL(location.href);
    Globals.ROOM_ID = url.searchParams.get("roomID");
    initialiseParty();
}

function embedInPage(fn) {
    console.log("EMBEDDING NETFLIX PARTY");
    const script = document.createElement("script");
    script.text = `(${fn})();`;
    document.documentElement.appendChild(script);
}

const url = new URL(location.href);
if (url.searchParams.has("roomID") && url.host == "www.netflix.com") embedInPage(NetflixPartyEmbeddedSource.toString());