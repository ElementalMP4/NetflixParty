var videoPlayer = window.netflix.appContext.state.playerApp.getAPI().videoPlayer;
var sessionId = videoPlayer.getAllPlayerSessionIds()[0];
var player = videoPlayer.getVideoPlayerBySessionId(sessionId);

function play() {
    player.play();
}

function pause() {
    player.pause();
}

function playAtTime(time) {
    player.seek(time);
    if (!player.isPlaying()) play();
}

function getPlayer() {
    return player;
}