# NetflixParty

[![Project Status: Active](https://www.repostatus.org/badges/latest/active.svg)](https://www.repostatus.org/#active) [![GPLv3 license](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) [![Build Status](https://jenkins.voidtech.de/buildStatus/icon?job=NetflixParty)](https://jenkins.voidtech.de/job/NetflixParty/)

It is better than Teleparty.

# Config File

```
http.port=6969 //Set the HTTP/WebSocket port
```

Note: if you want to spin up your own server, you will need to change the resource URL in the JS files.

# Using the Chrome Extension

## Installation

1) `git pull` this repository
2) Navigate to `chrome://extensions` in Google Chrome
3) Enable developer mode
4) Click load unpacked extension
5) Navigate to the `extension` folder in the files you just downloaded
6) Chrome should now load the manifest file 

## Usage

1) Go to Netflix and choose something to watch
2) When the video loads up, slap the Netflix icon and the room menu will open
3) Set a room colour then smack the create room button
4) Send the URL in the search bar to people who you want to join the room

## Using the chat

Press `ctrl + i` to open up the user menu. In this menu you can:

- Set a nickname
- Change your avatar
- Change your nickname colour

If you want to apply effects to your messages, have a look at the options using the `/help` command.