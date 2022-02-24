function embeddedCode() {
    var Gateway = new WebSocket("wss://netflixparty.voidtech.de/gateway");
    var VIDEO_PLAYER, SESSION_ID, PLAYER;

    var Globals = {
        LAST_MESSAGE_AUTHOR: "",
        ROOM_COLOUR: "",
        ROOM_ID: ""
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
        height: 93%;
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
        if (Gateway.readyState == Gateway.OPEN) Gateway.send(JSON.stringify(message));
    }

    function getDefault(value) {
        switch (value) {
            case "username":
                return "Netflix Party User";
            case "colour":
                return "#FF0000";
        }
    }

    function getStoredValue(value) {
        const storedVal = localStorage.getItem(value);
        return storedVal == null ? getDefault(value) : storedVal;
    }

    function pause() {
        PLAYER.pause();
    }

    function play() {
        PLAYER.play();
    }

    function playAtTime(time) {
        PLAYER.seek(time);
        if (!PLAYER.isPlaying()) play();
    }

    function handlePlayEvent() {
        console.log("Playing at " + PLAYER.getCurrentTime());
        sendGatewayMessage({ "type": "play-video", "data": { "timestamp": PLAYER.getCurrentTime(), "roomID": Globals.ROOM_ID } });
    }

    function handlePauseEvent() {
        console.log("Paused");
        sendGatewayMessage({ "type": "pause-video", "data": { "roomID": Globals.ROOM_ID } });
    }

    function connectToParty() {
        sendGatewayMessage({ "type": "join-party", "data": { "roomID": Globals.ROOM_ID, "username": getStoredValue("username") } });
    }

    function addListeners() {
        console.log("Attempting to add listeners...");
        if (PLAYER.isReady()) {
            console.log("Adding listeners!")
            document.getElementsByTagName("video")[0].onplay = function() { handlePlayEvent() };
            document.getElementsByTagName("video")[0].onpause = function() { handlePauseEvent() };
        } else {
            console.log("Waiting before next listener attempt");
            setTimeout(addListeners, 500);
        }
    }

    function initialiseParty() {
        VIDEO_PLAYER = window.netflix.appContext.state.playerApp.getAPI().videoPlayer;
        SESSION_ID = VIDEO_PLAYER.getAllPlayerSessionIds();
        PLAYER = VIDEO_PLAYER.getVideoPlayerBySessionId(SESSION_ID);
        console.log("NETFLIX PARTY EMBEDDED");
        addListeners();
        injectPage();
    }

    function addChatMessage(data) {
        const author = data.author;
        const colour = data.colour;
        const content = data.content;
        const modifiers = data.modifiers !== "" ? `class="${data.modifiers}"` : "";
        const avatar = data.avatar;

        let newMessage = `<div class="chat-message">`;
        if (Globals.LAST_MESSAGE_AUTHOR !== author) {
            newMessage += `<img class="user-image" src="${modifiers.includes("system") ? avatar : ("/avatar/" + avatar)}">`;
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
        addChatMessage({ "author": "System", "colour": Globals.ROOM_COLOUR, "content": message, "modifiers": "system", "avatar": "/favicon.png" });
    }

    function injectPage() {
        let stylesheet = document.createElement("style");
        stylesheet.innerText = STYLESHEET_RULES;
        document.head.appendChild(stylesheet);
        let videoDiv = document.querySelector("#appMountPoint > div > div > div.watch-video > div");
        videoDiv.style.display = "inline-block";
        videoDiv.style.width = "80%"
        videoDiv.style.float = "left";
        videoDiv.insertAdjacentHTML("afterend", `<div id="chat"></div>`);
        let chat = document.getElementById("chat");
        chat.style.height = "100%"
        chat.style.width = "20%";
        chat.style.float = "right";
        let chatHistory = document.createElement("div");
        chatHistory.classList.add("chat");
        chatHistory.id = "chat-history";
        chat.appendChild(chatHistory);
        chat.insertAdjacentHTML("beforeend", `
        <input type="text" id="chat-input" placeholder="Enter a message">
        <p class="typing-message typing" id="typing-message"><span>•</span><span>•</span><span>•</span> People are typing</p>
        `);
        displayLocalMessage("Ready!");
    }

    Gateway.onopen = function() {
        console.log("Gateway Connected");
        window.Gateway = Gateway;
        connectToParty();
    };

    Gateway.onclose = function() {
        console.log("Gateway Disconnected")
    };

    Gateway.onmessage = function(msg) {
        const message = JSON.parse(msg.data);
        console.log(message);
        switch (message.origin) {

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
if (url.searchParams.has("roomID")) setTimeout(() => { embedInPage(embeddedCode) }, 5000);