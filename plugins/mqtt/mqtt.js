const EventEmitter = require('events').EventEmitter,
      logger = require('../../logger').logger,
      util = require('util'),
      mqtt = require('mqtt'),
      ip = require('ip');

function MQTT(Dashboard, app, io, config) {
  EventEmitter.call(this);

  let self = this,
      modulesConfig;

  self.start = function() {

    modulesConfig = Dashboard.getConfig().modules.filter(module => module.config.plugin === 'mqtt').map(module => module.config);

    if (self.client) {
      self.emit('connect');
      return;
    }

    self.client = mqtt.connect(config.host, {
      clean: false,
      port: config.port || 1883,
      clientId: 'dashboard_' + ip.address(), // clientId must be unique, but determistic (between restarts).
      username: config.username,
      password: config.password
    });

    self.client.on('connect', function() {
      // Subscribe on all modules "statusTopic" topics.
      self.client.subscribe(modulesConfig.map(config => config.statusTopic));

      logger.info('Plugin ' + 'mqtt '.yellow.bold + 'connected'.blue);

      //TODO: this should be moved to switch! mqtt.js should be generic.
      // Momentary buttons should all be off to start with.
      for (let module of modulesConfig) {
        if (module.type === 'button momentary') {
          self.client.publish(module.setTopic, module.offCmd);
        }
      }

      self.emit('connect');
    });

    self.client.on('message', function(topic, message) {
      let subscribingModules = modulesConfig.filter(mod => mod.statusTopic === topic);
      for (let mod of subscribingModules) {
        self.emit('change', {
          state: String(message),
          id: mod.id
        });
      }
    });

    self.client.on('error', function(error) {
      logger.error(error);
    });
  };

  self.exit = function() {
    if (self.client) {
      self.client.end();
      self.client = null;
    }
  };

  self.getStatus = function(id) {
    logger.debug('Plugin ' + 'mqtt '.yellow.bold + 'getStatus'.blue, id);
    let moduleConfig = modulesConfig.filter(modConfig => modConfig.id === id)[0];

    if (moduleConfig && moduleConfig.getTopic && moduleConfig.getTopic.length > 0) {
      self.client.publish(moduleConfig.getTopic, '');
    }
  };
  //TODO: should these be moved to module to keep plugin clean of module logic and settings?
  self.setLevel = function(id, level) {
    logger.debug('Plugin ' + 'mqtt '.yellow.bold + 'setLevel'.blue, id, level);
    let moduleConfig = modulesConfig.filter(modConfig => modConfig.id === id)[0];
    self.client.publish(moduleConfig.setTopic, moduleConfig.levelCmd.replace('<level>', String(level)));
  };

  self.toggle = function(id, state) {
    logger.debug('Plugin ' + 'mqtt '.yellow.bold + 'toggle'.blue, id, state);
    let moduleConfig = modulesConfig.filter(modConfig => modConfig.id === id)[0];
    self.client.publish(moduleConfig.setTopic, state ? moduleConfig.onCmd : moduleConfig.offCmd);

  };
}

util.inherits(MQTT, EventEmitter);

module.exports = {
  create: function(Dashboard, app, io, config) {
    return new MQTT(Dashboard, app, io, config);
  }
};
