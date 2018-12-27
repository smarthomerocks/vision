/* Magic Mirror
 * Node Helper Superclass
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

var Class = require('../public/javascripts/class.js');
// var express = require('express');
// var path = require('path');
var colors = require('colors'), //eslint-disable-line no-unused-vars
    logger = require('../logger').logger;

var ModuleServer = Class.extend({
  init: function() {},

  loaded: function() {
    logger.info('Module ' + this.name.yellow.bold + ' loaded');
  },

  start: function() {
    logger.debug('Module ' + this.name.yellow.bold + ' started');
  },

  /* socketNotificationReceived(notification, payload)
	 * This method is called when a socket notification arrives.
	 *
	 * argument notification string - The identifier of the notification.
	 * argument payload mixed - The payload of the notification.
	 */
  socketNotificationReceived: function(notification, payload) {
    logger.debug(this.name + '-server received a socket notification: ' + notification + ' - Payload: ' + payload);
  },

  /* setName(name)
	 * Set the module name.
	 *
	 * argument name string - Module name.
	 */
  setName: function(name) {
    this.name = name;
  },

  /* setPath(path)
	 * Set the module path.
	 *
	 * argument name string - Module name.
	 */
  setPath: function(path) {
    this.path = path;
  },

  /* sendSocketNotification(notification, payload)
	 * Send a socket notification to the node helper.
	 *
	 * argument notification string - The identifier of the notification.
	 * argument payload mixed - The payload of the notification.
	 */
  sendSocketNotification: function(notification, payload) {
    this.io.of(this.name).emit(notification, payload);
  },

  setDashboard: function(dashboard) {
    this.dashboard = dashboard;
  },

  /* setExpressApp(app)
	 * Sets the express app object for this module.
	 * This allows you to host files from the created webserver.
	 *
	 * argument app Express app - The Express app object.
	 */
  setExpressApp: function(app) {
    this.expressApp = app;
  },

  /* setSocketIO(io)
	 * Sets the socket io object for this module.
	 * Binds message receiver.
	 *
	 * argument io Socket.io - The Socket io object.
	 */
  setSocketIO: function(io) {
    var self = this;
    self.io = io;
    self.socketList = [];

    logger.debug('Connecting socket for: ' + this.name);
    var namespace = this.name;
    io.of(namespace).on('connection', function(socket) {

      self.socketList.push(socket);

      logger.debug('Module ' + self.name.yellow.bold + ' connected');

      // add a catch all event.
      var onevent = socket.onevent;
      socket.onevent = function(packet) {
        var args = packet.data || [];
        onevent.call(this, packet); // original call
        packet.data = ['*'].concat(args);
        onevent.call(this, packet); // additional call to catch-all
      };

      socket.on('close', function() {
        self.socketlist.splice(self.socketlist.indexOf(socket), 1);
      });

      // register catch all.
      socket.on('*', function(notification, payload) {
        if (notification !== '*')
        //logger.debug('received message in namespace: ' + namespace);
          self.socketNotificationReceived(notification, payload);
      });
    });

  }
});

ModuleServer.create = function(moduleDefinition) {
  return ModuleServer.extend(moduleDefinition);
};

module.exports = ModuleServer;
