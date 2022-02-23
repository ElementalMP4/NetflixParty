function embeddedCode() {
    var Gateway = new WebSocket("wss://netflixparty.voidtech.de/gateway");
    var VIDEO_PLAYER, SESSION_ID, PLAYER, ROOM_ID;

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
        sendGatewayMessage({ "type": "play-video", "data": { "timestamp": PLAYER.getCurrentTime(), "roomID": ROOM_ID } });
    }

    function handlePauseEvent() {
        console.log("Paused");
        sendGatewayMessage({ "type": "pause-video", "data": { "roomID": ROOM_ID } });
    }

    function connectToParty() {
        sendGatewayMessage({ "type": "join-party", "data": { "roomID": ROOM_ID, "username": getStoredValue("username") } });
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
        connectToParty();
    }

    function initialiseParty() {
        VIDEO_PLAYER = window.netflix.appContext.state.playerApp.getAPI().videoPlayer;
        SESSION_ID = VIDEO_PLAYER.getAllPlayerSessionIds();
        PLAYER = VIDEO_PLAYER.getVideoPlayerBySessionId(SESSION_ID);
        console.log("NETFLIX PARTY EMBEDDED");
        addListeners();
    }

    function injectPage() {
        //Inject the page here
    }

    Gateway.onopen = () => {
        console.log("Gateway Connected");
    };
    Gateway.onclose = function() { console.log("Gateway Disconnected") };
    Gateway.onmessage = function(msg) {
        const message = JSON.parse(msg.data);
        console.log(message);
        switch (message.origin) {
            case "join-party":
                if (message.success) Gateway.close();
                else injectPage();
                break;
            case "system-message":
                switch (message.data.type) {
                    case "play-video":
                        if (!PLAYER.isPlaying()) {
                            playAtTime(message.data.data.time);
                        }
                        break;
                    case "pause-video":
                        if (PLAYER.isPlaying()) {
                            PLAYER.pause();
                        }
                        break;
                }
            case "chat-message":
                break;
        }
    }

    let url = new URL(location.href);
    ROOM_ID = url.searchParams.get("roomID");
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