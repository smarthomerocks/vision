/**
 * Volumio plugin as backend to the Media-player module
 */

const EventEmitter = require('events').EventEmitter,
      socketIO = require('socket.io-client'),
      util = require('util'),
      colors = require('colors'); //eslint-disable-line no-unused-vars

/**
 * Class of the plugin.
 * @param {*} Dashboard Reference to the dashboard
 * @param {*} app Express.js instance
 * @param {*} io Socket.io instance
 * @param {*} config config for this plugin from config.json
 */
function Volumio(Dashboard, app, io, config) {
  EventEmitter.call(this);

  let self = this;
  self.players = {};
  self.connected = false;
  
  /**
   * Function that will be called upon when this plugin is initialized.
   * Setup hardware, eventlisteners and other stuff you need here.
   * When done, you should emit the "connect"-event to signal that you are done.
   */
  self.start = function() {

    // If start is called upon multiple times, we only do initialization the first time.
    if(self.connected) {
      self.emit('connect');
      return;
    }

    self.modulesConfig = Dashboard.getConfig().modules.filter(module => module.config.plugin === 'volumio').map(module => module.config);
    
    for (let player of self.modulesConfig) {
      registerDevice(player.devicename);
    }
    
    console.log('Plugin ' + 'volumio '.yellow.bold + 'connected'.blue);        
    self.connected = true;
    self.emit('connect');
  };

  function registerDevice(url) {
    let socket = socketIO(url);
    self.players[url] = {
      socket: socket,
      lastState: {}
    };

    socket.on('pushState', function(data) {
      let player = self.players[url];
      
      if (player) {
        let change = {
          device: url,
          currenttrack :{
            artist : data.artist,
            album : data.album,
            title : data.title,
            duration : data.duration,
            albumart : url + data.albumart,
            type : data.trackType
          },
          nexttrack :{},
          elapsedtime: data.seek / 1000,  // devide with 1000 to get back to seconds
          playbackstate: (data.status === 'play' ? 'PLAYING' : 'STOPPED'),
          volume: data.volume
        };

        player.lastState = change;

        self.emit('change', change);
      }
    });
  }

  /**
   * Function will be called upon when the application shuts down.
   * Close down connections and clean up after you.
   */
  self.exit = function() {
    
  };

  this.changePlayState = function(devicename, state) {
    let player = self.players[devicename];
    
    if (player) {
      if (player.lastState && player.lastState.playbackstate === 'PLAYING') {
        player.socket.emit('stop', null);
      } else {
        player.socket.emit('play', null);
      }
    }
  },

  this.changeVolume = function(devicename, volume) {
    let player = self.players[devicename];
    
    if (player) {
      player.socket.emit('volume', parseInt(volume));
    }
  },

  this.prev = function(devicename) {
    let player = self.players[devicename];
    
    if (player) {
      player.socket.emit('prev', null);
    }
  },

  this.next = function(devicename) {
    let player = self.players[devicename];
    
    if (player) {
      player.socket.emit('next', null);
    }
  },

  this.trackSeek = function(devicename, duration) {
    let player = self.players[devicename];
    
    if (player) {
      player.socket.emit('seek', parseInt(duration));
    }
  },

  this.favorite = function(devicename, favoriteName) {
    let player = self.players[devicename];
    
    if (player) {

      player.socket.once('pushQueue', () => {
        player.socket.once('pushBrowseLibrary', data => {
          let favoList = data.navigation.lists[0].items.find(item => {
            return item.title === favoriteName;
          });

          if (favoList) {
            player.socket.emit('addPlay', {
              service: favoList.service,
              title: favoList.title,
              uri: favoList.uri
            });
          }
        });

        player.socket.emit('browseLibrary', {
          uri: 'spotify/playlists'
        });
      });
      
      player.socket.emit('clearQueue', null);
    }
  },

  this.getStatus = function(devicename) {
    let player = self.players[devicename];

    if (player) {
      player.socket.emit('getState', null);
    }
  };
}

util.inherits(Volumio, EventEmitter);

module.exports = {
  create: function(Dashboard, app, io, config) {
    return new Volumio(Dashboard, app, io, config);
  }
};
