"use strict";

var Globals = {
    RoomID: "",
    Gateway: {},
    ControlFreezer: {
        ControlsFrozen: false,
        ControlFreezeTimer: {}
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

//Use this to control the netflix player. Do NOT control the <video> element directly. Only use it for listening
function getVideoPlayer() {
    let netflixAPI = window.netflix.appContext.state.playerApp.getAPI().videoPlayer;
    let session = netflixAPI.getAllPlayerSessionIds().find((sessionID => sessionID.includes("watch")));
    return netflixAPI.getVideoPlayerBySessionId(session);
}

function pause() {
    if (controlsFrozen()) return;
    if (getVideoPlayer().isPaused()) LogMessage("Ignoring pause event");
    else {
        LogMessage("Automated pause event fired");
        freezeControls();
        getVideoPlayer().pause();
    }
}

function playAtTime(time) {
    if (controlsFrozen()) return;
    if (getVideoPlayer().isPlaying()) LogMessage("Ignoring play event");
    else {
        LogMessage("Automated play event fired");
        freezeControls();
        getVideoPlayer().seek(time);
        getVideoPlayer().play();
    }
}

function convertMillisToTimestamp(millis) {
    return new Date(millis).toISOString().slice(11, 19)
}

function handlePlayEvent() {
    const timeStamp = convertMillisToTimestamp(getVideoPlayer().getCurrentTime());
    LogMessage("Playing at " + timeStamp);
    displayLocalMessage("Video Playing at " + timeStamp);
    sendGatewayMessage({ "type": "play-video", "data": { "timestamp": getVideoPlayer().getCurrentTime(), "roomID": Globals.RoomID } });
}

function handlePauseEvent() {
    LogMessage("Paused");
    displayLocalMessage("Video Paused");
    sendGatewayMessage({ "type": "pause-video", "data": { "roomID": Globals.RoomID } });
}

function connectToParty() {
    sendGatewayMessage({ "type": "join-party", "data": { "roomID": Globals.RoomID, "username": getStoredValue("username") } });
}

function actuallyAddListeners() {
    let video = document.getElementsByTagName("video")[0];
    try {
        video.onpause = function() { handlePauseEvent() };
    } catch (error) {
        console.error(error);
        LogMessage("Could not change pause listener.");
    }

    try {
        video.onplay = function() { handlePlayEvent() };
    } catch (error) {
        console.error(error);
        LogMessage("Could not change play listener.");
    }

    //We observe the video element to see if the SRC value changes. If it does, we know that a new video has been set and we need to
    //re attach our listeners so we can detect pause/play events.
    let observer = new MutationObserver((changes) => {
        changes.forEach(change => {
            if (change.attributeName.includes('src')) {
                LogMessage("Video SRC change detected. Reattaching listeners");
                actuallyAddListeners();
            }
        });
    });
    observer.observe(video, { attributes: true });
}

function addListeners() {
    LogMessage("Attempting to add listeners...");
    let player = getVideoPlayer();
    if (player != undefined && document.getElementsByTagName("video")[0] != undefined) {
        if (player.isReady()) {
            LogMessage("Adding listeners!");
            actuallyAddListeners();
            connectToParty();
        } else {
            LogMessage("Player not ready! Waiting before next listener attempt");
            setTimeout(addListeners, 1000);
        }
    } else {
        LogMessage("Player undefined! Waiting before next listener attempt");
        setTimeout(addListeners, 1000);
    }
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
        case "pause-video":
            pause();
            break;
        case "play-video":
            playAtTime(message.data.time);
            break;
    }
}

const url = new URL(location.href);
if (url.searchParams.has("roomID") && url.host == "www.netflix.com") {
    Globals.RoomID = url.searchParams.get("roomID");
    addListeners();
    pause();
}