# NetflixParty

[![Project Status: Active](https://www.repostatus.org/badges/latest/active.svg)](https://www.repostatus.org/#active) [![GPLv3 license](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) [![Build Status](https://jenkins.voidtech.de/buildStatus/icon?job=NetflixParty)](https://jenkins.voidtech.de/job/NetflixParty/)

It is better than Teleparty.

# Config File

```
http.port=6969 //Set the HTTP/WebSocket port
cache.TextIsEnabled=true //Choose whether text files should be cached
cache.BinaryIsEnabled=true //Choose whether binary files should be cached
```

Note: if you want to spin up your own server, you will need to change the `RESOURCE_URL` value in the JS files to your own domain.

# Using the Chrome Extension

## Installation

1) Download the latest release from this page
2) Navigate to `chrome://extensions` in Google Chrome
3) Enable developer mode
4) Click load unpacked extension
5) Navigate to the `extension` folder in the files you just downloaded
6) Chrome should now load the manifest file 

Ignore any errors that Chrome may scream about, it is just complaining about Manifest V2 being deprecated.

## Why no Chrome Store?

Due to my age and the use of Manifest V2, this extension can't be put on the chrome store yet. However, by the time I port this to Manifest V3 I'll probably be the right age to get this on the chrome store. 

## Usage

1) Go to Netflix and choose something to watch
2) When the video loads up, slap the NetflixParty icon and the room menu will open
3) Set a room colour then smack the create room button
4) Hit the NetflixParty icon again and press "Copy the room URL" to share the URL with your chums
5) Your homies click the URL you sent and they will be sent straight to Netflix, no NetflixParty account required.

## Using the chat

Press `ctrl + i` to open up the user menu. In this menu you can:

- Set a nickname
- Change your avatar
- Change your nickname colour

If you want to apply effects to your messages, have a look at the options using the `/help` command.
