/**
 * This directory contains a skeleton/template for new plugins, the minimal required code for a plugin.
 * When creating a new plugin, make a copy of this directory and do a search-and-replace for the word "template" and replace it with the name of your new plugin.
 * Remeber to also update the README.md-file!
 * 
 * The name of the new directory is important, since it defines the name of the plugin that will be referenced in the config.json-file later.
 */

const EventEmitter = require('events').EventEmitter,
      util = require('util'),
      colors = require('colors'); //eslint-disable-line no-unused-vars

/**
 * Class of the plugin.
 * There will only be created ONE instance of the class, so the code need to support possible multiple modules using this plugin and multiple hardware devices.
 * E.g. if this plugin where to implement support for Webcameras there will not be a instance of this plugin for each available camera, instead this single instance should support ALL available cameras on the network.
 * Since plugins inherits from EventEmitter(https://nodejs.org/api/events.html#events_class_eventemitter), modules may subscribe on event that we emit here using "on", "once", "off", and the other available functions.
 * @param {*} Dashboard Reference to the dashboard
 * @param {*} app Express.js instance
 * @param {*} io Socket.io instance
 * @param {*} config config for this plugin from config.json
 */
function Template(Dashboard, app, io, config) {
  EventEmitter.call(this);

  let self = this;
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

    // Sometimes it is useful to get the configuration for the modules that is using this plugin, it can be accomplished with this line of code (replace "template" with the name of your plugin).
    // See example of this in the MQTT-plugin, if this plugin has no need of that you should remove this line of code.
    self.modulesConfig = Dashboard.getConfig().modules.filter(module => module.config.plugin === 'template').map(module => module.config);
    
    // DO YOUR INITIALIZATION STUFF HERE!

    console.log('Plugin ' + '<template name> '.yellow.bold + 'connected'.blue);        
    self.connected = true;
    self.emit('connect');
  };

  /**
   * Function will be called upon when the application shuts down.
   * Close down connections and clean up after you.
   */
  self.exit = function() {
    
  };

  // ADD YOUR FUNCTIONS HERE!
  
  /**
   * Example function that could be called upon by a module to get the status for a device.
   * @param {String} id name of device.
   */
  self.getStatus = function(id) {
    // GET STATUS FROM HARDWARE.

    // Emit an event with the new status.
    self.emit('change', {id: id, status: '123'});
  };
}

util.inherits(Template, EventEmitter);

module.exports = {
  create: function(Dashboard, app, io, config) {
    return new Template(Dashboard, app, io, config);
  }
};
