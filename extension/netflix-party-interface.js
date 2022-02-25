function embeddedCode() {
    var Globals = {
        LAST_MESSAGE_AUTHOR: "",
        ROOM_COLOUR: "",
        ROOM_ID: "",
        PLAYER: {},
        VIDEO_PLAYER: {},
        SESSION_ID: "",
        GATEWAY: {},
        CHAT_READY: false
    };

    Globals.GATEWAY = new WebSocket("wss://netflixparty.voidtech.de/gateway");

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
    `;

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
                return "beagle";
        }
    }

    function getStoredValue(value) {
        const storedVal = localStorage.getItem(value);
        return storedVal == null ? getDefault(value) : storedVal;
    }

    function pause() {
        Globals.PLAYER.pause();
    }

    function play() {
        Globals.PLAYER.play();
    }

    function playAtTime(time) {
        Globals.PLAYER.seek(time);
        if (!Globals.PLAYER.isPlaying()) play();
    }

    function handlePlayEvent() {
        console.log("Playing at " + Globals.PLAYER.getCurrentTime());
        displayLocalMessage("Video Playing at " + Globals.PLAYER.getCurrentTime());
        sendGatewayMessage({ "type": "play-video", "data": { "timestamp": Globals.PLAYER.getCurrentTime(), "roomID": Globals.ROOM_ID } });
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
        try {
            document.getElementsByTagName("video")[0].onpause = function() { handlePauseEvent() };
        } catch (error) {
            console.error(error);
            console.log("Could not change pause listener. This is not fine.");
        }

        try {
            document.getElementsByTagName("video")[0].onplay = function() { handlePlayEvent() };
        } catch (error) {
            console.error(error);
            console.log("Could not change play listener. This is not fine.");
        }

        injectPage();
    }

    function addListeners() {
        console.log("Attempting to add listeners...");
        Globals.VIDEO_PLAYER = window.netflix.appContext.state.playerApp.getAPI().videoPlayer;
        Globals.SESSION_ID = Globals.VIDEO_PLAYER.getAllPlayerSessionIds();
        Globals.PLAYER = Globals.VIDEO_PLAYER.getVideoPlayerBySessionId(Globals.SESSION_ID);
        if (Globals.PLAYER != undefined && document.getElementsByTagName("video")[0] != undefined) {
            if (Globals.PLAYER.isReady()) {
                console.log("Adding listeners!");
                actuallyAddListeners();
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
            newMessage += `<img class="user-image" src="${modifiers.includes("system") ? avatar : ("https://netflixparty.voidtech.de/avatar/" + avatar)}">`;
            newMessage += `<p class="msg-nickname" style="color:${colour}">${author}</p><br>`;
        }
        newMessage += `<p ${modifiers}>${content}</p></div>`;
        if (Globals.LAST_MESSAGE_AUTHOR !== author) newMessage += "<br>";

        Globals.LAST_MESSAGE_AUTHOR = author;

        let chatHistory = document.getElementById("chat-history");
        chatHistory.insertAdjacentHTML('afterbegin', newMessage);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function showTypingMessage() {
        document.getElementById("typing-message").style.display = "block";
    }

    function hideTypingMessage() {
        document.getElementById("typing-message").style.display = "none";
    }

    function displayLocalMessage(message) {
        addChatMessage({ "author": "System", "colour": Globals.ROOM_COLOUR, "content": message, "modifiers": "system", "avatar": "https://netflixparty.voidtech.de/avatar/system" });
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
            <br><input type="text" id="chat-input" placeholder="Enter a message">
            <p class="typing-message typing" id="typing-message"><span>•</span><span>•</span><span>•</span> People are typing</p>
        `);
        //Make the typing thingy go away
        hideTypingMessage();
        Globals.CHAT_READY = true;
        //Chat Listener
        document.getElementById("chat-input").addEventListener("keyup", handleChatEvent);
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
        connectToParty();
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
        }
    }

    function handleHelpCommand() {
        displayLocalMessage(`Chat Command Help:<br>
    /help - shows this message<br><br>
    /i [message] - changes your message to italics<br><br>
    /u [message] - changes your message to underline<br><br>
    /b [message] - makes your message bold<br><br>
    /s [message] - changes your message to strikethrough<br><br>
    /c [message] - changes your message to cursive<br><br>
    /cc [message] - cHaNgEs YoUr TeXt LiKe ThIs<br><br>
    /big [message] - makes your message big<br><br>
    /r - reloads your session<br><br>
    /tts - send a text-to-speech message<br><br>
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
    script.text = `(${fn.toString()})();`;
    document.documentElement.appendChild(script);
}

let url = new URL(location.href);
if (url.searchParams.has("roomID")) embedInPage(embeddedCode);