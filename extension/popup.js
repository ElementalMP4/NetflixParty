const RESOURCE_URL = "netflixparty.voidtech.de"; //Make sure this URL has no protocol. Just the domain.

function showMessage(message) {
    document.getElementById("user-message").innerHTML = message;
}

chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var tab = tabs[0];
    const url = new URL(tab.url);
    if (url.host == "www.netflix.com") {
        if (url.pathname == "/browse") {
            showMessage("Choose something to watch first, then open this up again to make a room!");
        } else if (url.pathname.includes("watch")) {
            if (url.searchParams.has("roomID")) window.location.href = "shareroom.html";
            else window.location.href = "createroom.html";
        }
    } else if (url.host == RESOURCE_URL) {
        showMessage("You don't need to visit this page (although you are more than welcome to!), the chrome extension will do everything for you!");
    }
});