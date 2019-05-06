/**
 * Spotify Connect plugin as backend to the Media-player module
 */

//https://github.com/thelinmichael/spotify-web-api-node
//https://beta.developer.spotify.com/console/get-playlists/
//https://developer.spotify.com/web-api/using-scopes/

const EventEmitter = require('events').EventEmitter,
      SpotifyWebApi = require('spotify-web-api-node'),
      util = require('util'),
      fs = require('fs'),
      os = require('os'),
      path = require('path'),
      logger = require('../../logger').logger,
      colors = require('colors'), //eslint-disable-line no-unused-vars
      spotifyStateName = 'vision_spotifystate_1337',
      spotifyTokens = path.join(__dirname, 'spotifyTokens.json'),
      // https://developer.spotify.com/documentation/general/guides/scopes/
      scopes = [
        'playlist-read-private',
        'playlist-read-collaborative',
        'user-modify-playback-state',
        'user-read-playback-state',
        'user-read-currently-playing'];

/**
 * Class of the plugin.
 * @param {*} Dashboard Reference to the dashboard
 * @param {*} app Express.js instance
 * @param {*} io Socket.io instance
 * @param {*} config config for this plugin from config.json
 */
function Spotify(Dashboard, app, io, config) {
  EventEmitter.call(this);

  let self = this;
  self.spotifyApi = undefined,
  self.players = {};
  self.pluginConfig = config;
  self.connected = undefined;
  self.credentialsTimeout = undefined;
  self.getStatusInterval = undefined;
  self.spotifyCode = undefined;

  function refreshToken(timeout) {
    if (self.credentialsTimeout) {
      clearTimeout(self.credentialsTimeout);
    }

    self.credentialsTimeout = setTimeout(() => {
      self.spotifyApi.refreshAccessToken().then(data => {
        logger.info('Spotify accesstoken has been refreshed.');
        self.spotifyApi.setAccessToken(data.body.access_token);

        fs.writeFileSync(spotifyTokens, JSON.stringify({
          access_token: data.body.access_token,
          refresh_token: self.spotifyApi.getRefreshToken(),
          expires_in: data.body.expires_in,
          gotToken: new Date()
        }, null, 4));
        
        refreshToken((data.body.expires_in * 0.8) * 1000);
      })
        .catch((err) => {
          logger.warn(`Failed to refresh Spotify accesstoken. statuscode: ${err.statusCode}, error: ${err.stack}`);
          refreshToken(10000);
        });
    }, timeout);
  }

  function authenticate(authorizationCode, tokens) {
    if (tokens && tokens.access_token && tokens.refresh_token && tokens.expires_in) {
      logger.info('Plugin ' + 'spotify '.yellow.bold + 'loaded credentials'.blue);
      //TODO: compare if expiretime > gotToken + expires_in.
      // Save the access token so that it's used in future calls
      self.spotifyApi.setAccessToken(tokens.access_token);
      self.spotifyApi.setRefreshToken(tokens.refresh_token);
      refreshToken((tokens.expires_in * 0.8) * 1000);

      return Promise.resolve();
    }

    return self.spotifyApi.authorizationCodeGrant(authorizationCode)
      .then(credentials => {
        logger.info('Plugin ' + 'spotify '.yellow.bold + `got credentials, access token expires in ${credentials.body.expires_in} seconds`.blue);

        // Save the access token so that it's used in future calls
        self.spotifyApi.setAccessToken(credentials.body.access_token);
        self.spotifyApi.setRefreshToken(credentials.body.refresh_token);
        refreshToken((credentials.body.expires_in * 0.8) * 1000);

        fs.writeFileSync(spotifyTokens, JSON.stringify({
          access_token: credentials.body.access_token,
          refresh_token: credentials.body.refresh_token,
          expires_in: credentials.body.expires_in,
          gotToken: new Date()
        }, null, 4));
      },
      function(err) {
        logger.error(`Spotify authenticate, something went wrong! statuscode: ${err.statusCode}, error: ${err.stack}`);
      });
  }

  /*
   * Callback used by Spotify to send back result after a authentication attempt.
   */
  /*function spotifyCallback(req, res) {
    // save authorisation code received from Spotify, but only if state matches what we sent to Spotify.
    if (req.query.state === spotifyStateName) {
      authenticate(req.query.code);
    }
    res.sendStatus(200);
  }*/

  /**
   * Function that will be called upon when this plugin is initialized.
   * Setup hardware, eventlisteners and other stuff you need here.
   * When done, you should emit the "connect"-event to signal that you are done.
   */
  this.start = function() {
    if (self.connected) {
      return;
    }

    self.modulesConfig = Dashboard.getModulesByPluginName('spotify').map(module => module.config);

    //app.get('/spotifycallback', spotifyCallback);
                
    // Create the api object with the credentials
    self.spotifyApi = new SpotifyWebApi({
      clientId: self.pluginConfig.clientId,
      clientSecret: self.pluginConfig.clientSecret,
      redirectUri: self.pluginConfig.redirectUri
    });

    let tokens;

    if (fs.existsSync(spotifyTokens)) {
      tokens = JSON.parse(fs.readFileSync(spotifyTokens));
    }

    if (!self.pluginConfig.authenticationCode) {
      logger.info(`Visit and accept the terms on the following page to activate the Spotify-plugin. Copy the activation code from the returnUri and paste it into config.${os.EOL} "${self.spotifyApi.createAuthorizeURL(scopes, spotifyStateName)}"`);
      process.exit(1);
    }
    
    authenticate(self.pluginConfig.authenticationCode, tokens).then(() => {

      self.connected = true;
      logger.info('Plugin ' + 'spotify '.yellow.bold + 'connected'.blue);        

      Promise.all([
        self.spotifyApi.getMyDevices(),
        self.spotifyApi.getUserPlaylists(self.pluginConfig.username, { limit: 30 })
      ])      
        .then(results => {
          let devices = results[0].body.devices;
          logger.info('Available devices:');
          for (let device of devices) {
            logger.info(`id: ${device.id}, name: "${device.name}", is_active: ${device.is_active}`);
            self.players[device.id] = {};
          }

          let playlists = results[1].body.items.map(playlist => {
            return {
              id: playlist.uri,
              name: playlist.name
            };
          });

          logger.info('Available playlists:');
          for (let playlist of playlists) {
            logger.info(`id: ${playlist.id}, name: "${playlist.name}"`);
          }

          self.emit('connect');
          // poll playback state every 5 sec since Spotify does not support web services yet.
          self.getStatusInterval = setInterval(() => {
            self.getStatus();
          }, 5000);
        }).catch(err => {
          logger.error(`Plugin "spotify" got error when listing devices and playlists. statuscode: ${err.statusCode}, error: ${err.stack}`);
        });
    }).catch(err => {
      logger.error(`Plugin "spotify" got error when authenticating. ${err.stack}`);
    });
  };

  /**
   * Function will be called upon when the application shuts down.
   * Close down connections and clean up after you.
   */
  this.exit = function() {
    if (self.credentialsTimeout) {
      clearTimeout(self.credentialsTimeout);
      self.credentialsTimeout = null;
    }
    if (self.getStatusInterval) {
      clearInterval(self.getStatusInterval);
      self.getStatusInterval = null;
    }
  };

  this.changePlayState = function(devicename, state) {
    let player = self.players[devicename];
    
    if (player) {
      if (player.lastState && player.lastState.playbackstate === 'PLAYING') {
        logger.debug('Plugin ' + 'spotify '.yellow.bold + '"stop"'.blue);
        self.spotifyApi.pause({ device_id: player }).then(() => {
          self.getStatus();
        }).catch(err => {
          logger.error(`Plugin "spotify" got error when pausing playback. ${err.stack}`);
        });
      } else {
        logger.debug('Plugin ' + 'spotify '.yellow.bold + '"play"'.blue);
        self.spotifyApi.play({ device_id: player }).then(() => {
          self.getStatus();
        }).catch(err => {
          logger.error(`Plugin "spotify" got error when starting playback. ${err.stack}`);
        });
      }
    }
  };

  this.changeVolume = function(devicename, volume) {
    let player = self.players[devicename];
    
    if (player) {
      logger.debug('Plugin ' + 'spotify '.yellow.bold + `"changeVolume"=${volume}`.blue);
      self.spotifyApi.setVolume(volume, { device_id: player }).then(() => {
        self.getStatus();
      }).catch(err => {
        logger.error(`Plugin "spotify" got error when changing volume. ${err.stack}`);
      });
    }
  };

  this.prev = function(devicename) {
    let player = self.players[devicename];
    
    if (player) {
      logger.debug('Plugin ' + 'spotify '.yellow.bold + '"prev"'.blue);
      self.spotifyApi.skipToPrevious().then(() => {
        self.getStatus();
      }).catch(err => {
        logger.error(`Plugin "spotify" got error when requesting previous track. ${err.stack}`);
      });
    }
  };

  this.next = function(devicename) {
    let player = self.players[devicename];
    
    if (player) {
      logger.debug('Plugin ' + 'spotify '.yellow.bold + '"next"'.blue);
      self.spotifyApi.skipToNext().then(() => {
        self.getStatus();
      }).catch(err => {
        logger.error(`Plugin "spotify" got error when requesting next track. ${err.stack}`);
      });
    }
  };

  this.trackSeek = function(devicename, duration) {
    let player = self.players[devicename];
    
    if (player) {
      logger.debug('Plugin ' + 'spotify '.yellow.bold + `"seek"=${duration}`.blue);
      //TODO: implement: https://github.com/thelinmichael/spotify-web-api-node/blob/master/src/spotify-web-api.js#L1259
    }
  };

  this.favorite = function(devicename, favoriteName) {
    let player = self.players[devicename];
    
    if (player) {
      logger.debug('Plugin ' + 'spotify '.yellow.bold + `"play favorite"="${favoriteName}"`.blue);
      self.spotifyApi.play({ device_id: devicename, context_uri: favoriteName }).then(() => {
        self.getStatus();
        self.spotifyApi.setRepeat({state: 'context'});
        self.spotifyApi.setShuffle({state: 'false'});
      }).catch(err => {
        logger.error(`Plugin "spotify" got error when changing to playlist "${favoriteName}". ${err.stack}`);
      });
    }
  };

  this.getStatus = function() {
    // Get information about current playing song for signed in user
    if (self.connected) {
      self.spotifyApi.getMyCurrentPlaybackState({}).then(result => {
        let state = result.body;
        if (state.device) { // sometimes we just get an empty state object.
          let change = {
            device: state.device.id,
            currenttrack :{
              artist : state.item.album.artists[0].name,
              album : state.item.album.name,
              title : state.item.name,
              duration : state.item.duration_ms / 1000,
              type : state.item.type
            },
            nexttrack :{},          
            elapsedtime: state.progress_ms / 1000,
            playbackstate: state.is_playing ? 'PLAYING' : 'STOPPED',
            volume: state.device.volume_percent
          };
          
          if (state.item.album.images.length === 1) {
            change.currenttrack.albumart = state.item.album.images[0].url;
          } else if (state.item.album.images.length > 1) {
            change.currenttrack.albumart = state.item.album.images[1].url;
          }

          if (!self.players.hasOwnProperty(change.device)) {
            self.players[change.device] = {};
          }
          let player = self.players[change.device];

          if (JSON.stringify(change) !== JSON.stringify(player.lastState)) {
            player.lastState = change;
            self.emit('change', change);
          }
        }
      }).catch(err => {
        logger.error(`Plugin "spotify" got error when requesting current playback state. ${err.stack}`);
      });
    }
  };
}

util.inherits(Spotify, EventEmitter);

module.exports = {
  create: function(Dashboard, app, io, config) {
    return new Spotify(Dashboard, app, io, config);
  }
};
