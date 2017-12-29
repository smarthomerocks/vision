const EventEmitter = require('events').EventEmitter,
      util = require('util'),
      _ = require('underscore'),
      SonosDiscovery = require('sonos-discovery'),
      logger = require('../../logger'),
      colors = require('colors'); //eslint-disable-line no-unused-vars
//var sonosdevice = require('sonos');
//var Listener = require('sonos/lib/events/listener');
//var async = require('async');


function Sonos(Dashboard, app, io, config) {
  EventEmitter.call(this);

  this.discovery = new SonosDiscovery();
  this.connected = false;

  this.timeout = config.timeout;
  //var devices = [];

  this.type = 'home';
  this.start = function() {

    var self = this;

    if(self.connected) {
      // Only update player list
      this.players = self.discovery.players;
      self.emit('connect');
      return;
    }

    logger.info('Plugin ' + 'sonos'.yellow.bold + ' start. Scanning for devices...');

    this.discovery.on('topology-change', function(data) {
      //socketServer.sockets.emit('topology-change', discovery.players);
    });

    this.discovery.on('transport-state', function(data) {
      //var playerDevice = self.discovery.getPlayerByUUID(data.uuid);
      var change = {
        device: data.roomName,
        currenttrack :{
          artist : data.state.currentTrack.artist,
          album : data.state.currentTrack.album,
          title : data.state.currentTrack.title,
          duration : data.state.currentTrack.duration,
          albumart : data.state.currentTrack.absoluteAlbumArtUri,
          type : data.state.currentTrack.type
        },
        nexttrack :{
          artist : data.state.nextTrack.artist,
          album : data.state.nextTrack.album,
          title : data.state.nextTrack.title,
          duration : data.state.nextTrack.duration,
          albumart : data.state.nextTrack.absoluteAlbumArtUri,
          type : data.state.currentTrack.type
        },
        elapsedtime: data.state.elapsedTime,
        playbackstate: data.state.playbackState,
        volume: data.state.volume
      };

      self.emit('change', change);
    });

    this.discovery.on('group-volume', function(data) {
      //socketServer.sockets.emit('group-volume', data);
    });

    this.discovery.on('volume-change', function(data) {
      var playerDevice = self.discovery.getPlayerByUUID(data.uuid);

      if (!playerDevice) return;
      var change = {
        device: playerDevice.roomName,
        currenttrack :{
          artist : playerDevice.state.currentTrack.artist,
          album : playerDevice.state.currentTrack.album,
          title : playerDevice.state.currentTrack.title,
          duration : playerDevice.state.currentTrack.duration,
          albumart : playerDevice.state.currentTrack.absoluteAlbumArtUri,
          type : playerDevice.state.currentTrack.type
        },
        nexttrack :{
          artist : playerDevice.state.nextTrack.artist,
          album : playerDevice.state.nextTrack.album,
          title : playerDevice.state.nextTrack.title,
          duration : playerDevice.state.nextTrack.duration,
          albumart : playerDevice.state.nextTrack.absoluteAlbumArtUri,
          type : playerDevice.state.nextTrack.type
        },
        elapsedtime: playerDevice.state.elapsedTime,
        playbackstate: playerDevice.state.playbackState,
        volume: playerDevice.state.volume
      };
          
      self.emit('change', change);
    });

    this.discovery.on('group-mute', function(data) {
      //socketServer.sockets.emit('group-mute', data);
    });

    this.discovery.on('mute-change', function(data) {
      //socketServer.sockets.emit('mute', data);
    });

    this.discovery.on('favorites', function(data) {
      //socketServer.sockets.emit('favorites', data);
    });

    this.discovery.on('queue-change', function(player) {
      logger.debug('queue-changed', player.roomName);
    });

    self.connected = true;
    this.players = self.discovery.players;
    self.emit('connect');
  },
  this.changePlayState = function(devicename, state) {

    var self = this;
    _.each(this.players, function(device) {
      if (device.roomName == devicename) {
        var player = self.discovery.getPlayerByUUID(device.uuid);
        if (!player) return;
        if(player.state.playbackState === 'PLAYING') {
          player.pause(function(err, stopped) {
          });
        }else {
          player.play(function(err, stopped) {
          });
        }
      }
    });

  },

this.changeVolume = function(devicename, volume) {
  var self = this;
  _.each(this.players, function(device) {
    if (device.roomName == devicename) {
      var player = self.discovery.getPlayerByUUID(device.uuid);
      if (!player) return;
      player.setVolume(volume, function(err, stopped) {
      });
    }
  });
},

this.prev = function(devicename) {
  var self = this;
  _.each(this.players, function(device) {
    if (device.roomName == devicename) {
      var player = self.discovery.getPlayerByUUID(device.uuid);
      if (!player) return;
      player.previousTrack(function(err, stopped) {
      });
    }
  });
},

this.next = function(devicename) {
  var self = this;
  _.each(this.players, function(device) {
    if (device.roomName == devicename) {
      var player = self.discovery.getPlayerByUUID(device.uuid);
      if (!player) return;
      player.nextTrack(function(err, stopped) {
      });
    }
  });
},

this.trackSeek = function(devicename, duration) {
  var self = this;
  _.each(this.players, function(device) {
    if (device.roomName == devicename) {
      var player = self.discovery.getPlayerByUUID(device.uuid);
      if (!player) return;
      player.timeSeek(duration);
    }
  });

},

this.favorite = function(devicename, favoriteName) {
  var self = this;
  _.each(this.players, function(device) {
    if (device.roomName == devicename) {
      var player = self.discovery.getPlayerByUUID(device.uuid);
      if (!player) return;
      player.replaceWithFavorite(favoriteName);

      setTimeout(function() {
        player.play(function(err, stopped) {
        });
      }, 500);
    }
  });

},

 this.getStatus = function(devicename) {

   var self = this;
   _.each(self.players, function(player) {
     if (player.roomName == devicename) {
       var playerDevice = self.discovery.getPlayerByUUID(player.uuid);

       if (!playerDevice) return;

       var change = {
         device: playerDevice.roomName,
         currenttrack :{
           artist : playerDevice.state.currentTrack.artist,
           album : playerDevice.state.currentTrack.album,
           title : playerDevice.state.currentTrack.title,
           duration : playerDevice.state.currentTrack.duration,
           albumart : playerDevice.state.currentTrack.absoluteAlbumArtUri,
           type : playerDevice.state.currentTrack.type
         },
         nexttrack :{
           artist : playerDevice.state.nextTrack.artist,
           album : playerDevice.state.nextTrack.album,
           title : playerDevice.state.nextTrack.title,
           duration : playerDevice.state.nextTrack.duration,
           albumart : playerDevice.state.nextTrack.absoluteAlbumArtUri,
           type : playerDevice.state.nextTrack.type
         },
         elapsedtime: playerDevice.state.elapsedTime,
         playbackstate: playerDevice.state.playbackState,
         volume: playerDevice.state.volume
       };

       self.emit('change', change);
     }
   });
 };

  this.exit = function() {
    this.discovery.dispose();
  };
}

util.inherits(Sonos, EventEmitter);

module.exports = {
  create: function(Dashboard, app, io, config) {
    return new Sonos(Dashboard, app, io, config);
  }
};
