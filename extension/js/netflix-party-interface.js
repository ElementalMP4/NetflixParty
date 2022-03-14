const RESOURCE_URL = "netflixparty.voidtech.de"; //Make sure this URL has no protocol. Just the domain.

function getInjectedScript() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", "https://" + RESOURCE_URL + "/netflix.js", false);
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

function embedInPage(fn) {
    console.log("EMBEDDING NETFLIX PARTY");
    const script = document.createElement("script");
    script.text = `(${fn})();`;
    document.documentElement.appendChild(script);
}

const url = new URL(location.href);
if (url.searchParams.has("roomID") && url.host == "www.netflix.com") embedInPage(getInjectedScript());