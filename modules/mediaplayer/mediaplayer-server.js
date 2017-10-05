var ModuleServer = require('../../lib/module-server.js');

module.exports = ModuleServer.create({
  socketNotificationReceived: function(command, data) {
    if (command === 'MEDIAPLAYER_CONNECT') {
      this.connectPlugin(data.plugin);
    } else if (command === 'MEDIAPLAYER_STATUS') {
      this.dashboard.mediaplayer.getStatus(data.plugin, data.device);
    } else if (command === 'MEDIAPLAYER_PLAYSTATE_CHANGE') {
      this.dashboard.mediaplayer.changePlayState(data.plugin, data.device, data.playbackState);
    } else if (command === 'MEDIAPLAYER_VOLUME_CHANGE') {
      this.dashboard.mediaplayer.changeVolume(data.plugin, data.device, data.volume);
    }else if (command === 'MEDIAPLAYER_PLAYSTATE_PREV') {
      this.dashboard.mediaplayer.prev(data.plugin, data.device);
    }else if (command === 'MEDIAPLAYER_PLAYSTATE_NEXT') {
      this.dashboard.mediaplayer.next(data.plugin, data.device);
    } else if (command == 'MEDIAPLAYER_TRACK_SEEK') {
      this.dashboard.mediaplayer.trackSeek(data.plugin, data.device, data.duration);
    }
  },

  connectPlugin: function(plugin) {
    var self = this;

    if (this.isConnected) {
      self.sendSocketNotification('MEDIAPLAYER_CONNECTED');
      return;
    }

    this.isConnected = true;

    this.dashboard.mediaplayer.once(plugin, 'connect', function(data) {
      self.sendSocketNotification('MEDIAPLAYER_CONNECTED');
    });

    this.dashboard.mediaplayer.on(plugin, 'change', function(data) {
      self.sendStatus(data.device, data);
    });

    this.dashboard.mediaplayer.start(plugin);
  },

  sendStatus: function(device, data) {
    this.sendSocketNotification('MEDIAPLAYER_STATUS', { device: device, data:data });
  }
});
