# Spotify Connect

Plugin name: spotify

## Description

This plugin is for the [Spotify Connect Web API](https://developer.spotify.com/web-api/). Any device that acts as a Spotify Connect host should be able to be controlled by this plugin (to some extent). The plugin has been tested with the [Volumio Spotify Connect-plugin](https://github.com/balbuze/volumio-plugins/tree/master/plugins/music_service/volspotconnect2) and the Sonos sound system. Note that this plugin ONLY works for Spotify Premium accounts, NOT the free ones!

IMPORTANT!
First you need to "register your app" at the Spotify webpage: https://beta.developer.spotify.com/dashboard/applications
- You can pick any name for your app, it's not important.
- But you must specify a working "Redirect URIs". This should be a public accessable endpoint where Spotify could reach this application after a login attempt. e.g. "http://myhome.se/spotifycallback"
- After creating the application, go back to the Spotify dashboard and click the registered app. Note the "Client ID" and "Client Secret" that is needed in the config below.


## Config

    "spotify": {
      clientId:     <string>,  // Spotify Client ID
      clientSecret: <string>,  // Spotify Client Secret
      redirectUri:  <string>,  // Public available endpoint
      authenticationCode: <string>, // Temporary fix for Spotify authentication, enter "code" from response of redirectUri here.
    }

### Config example

    "spotify": {
      clientId: "111222333",
      clientSecret: "444555666",
      redirectUri: "http://myhome.se/spotifycallback"
    }

## Author

    Henrik Östman
