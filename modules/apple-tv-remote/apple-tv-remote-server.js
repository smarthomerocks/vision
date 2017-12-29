var ModuleServer = require('../../lib/module-server.js'),
    logger = require('../../logger');

module.exports = ModuleServer.create({
  socketNotificationReceived: function(command, data) {
    if (command === 'APPLE_TV_REMOTE_CONNECT') {
      logger.debug('APPLE_TV_REMOTE_CONNECT');
      this.connectPlugin(data.plugin);
    } else if (command === 'APPLE_TV_REMOTE_SEND_COMMAND') {
      logger.debug('APPLE_TV_REMOTE_SEND_COMMAND');
      this.dashboard.remotecontrol.sendCommand(data.plugin, data.commands);
    }
  },

  connectPlugin: function(plugin) {
    var self = this;

    if (this.isConnected) {
      self.sendSocketNotification('APPLE_TV_REMOTE_CONNECT');
      return;
    }

    this.isConnected = true;

    this.dashboard.remotecontrol.once(plugin, 'connect', function(data) {
      self.sendSocketNotification('APPLE_TV_REMOTE_CONNECT');
    });

    this.dashboard.remotecontrol.start(plugin);
  }
});
