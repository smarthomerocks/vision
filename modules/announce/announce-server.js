var http = require('http');
var path = require('path');
var url = require('url');
var fs = require('fs');
var logger = require('../../logger');
var ModuleServer = require('../../lib/module-server.js');

module.exports = ModuleServer.create({
  socketNotificationReceived: function(command, data) {
    if (command === 'ANNOUNCE_CONNECT') {
      this.sendSocketNotification('ANNOUNCE_CONNECTED');
    } else if (command === 'ANNOUNCE_SEND') {
      this.sendAnnouncement(data);
    }
  },

  sendAnnouncement: function(data) {
    var filename = 'dashboard-announce-' + new Date().getTime() + '.wav',
        filePath = path.resolve(data.path + path.sep + filename),
        self = this;

    fs.writeFile(filePath, data.audio, function(err) {
      if (err) {
        logger.error(err);
        return;
      }

      var callback = function(response) {

        response.on('data', function() {
        });

        response.on('end', function() {
          fs.unlink(filePath, function(err) {
            self.sendSocketNotification('ANNOUNCE_STATUS', { sent: true });
          });
        });
      };

      var request = http.request(url.parse(data.url + (data.room === 'all' ? '/clipall/' : '/' + data.room + '/clip/') + filename + '/' + data.volume), callback);

      request.on('error', function(e) {
        logger.warn('problem with request: ' + e.message);
      });

      request.end();
    });
  }
});
