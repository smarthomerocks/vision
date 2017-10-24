const EventEmitter = require('events').EventEmitter,
      util = require('util'),
      mqtt = require('mqtt');

function MQTT(Dashboard, app, io, config) {
  EventEmitter.call(this);

  let self = this,
      modulesConfig;

  self.start = function() {

    modulesConfig = Dashboard.getConfig().modules.filter(module => module.config.plugin === 'mqtt').map(module => module.config);

    if (self.client) {

      self.emit('connect');

    } else {
      self.client = mqtt.connect(config.host, {
        clean: false,
        port: config.port || 1883,
        clientId: 'dashboard_' + Math.random().toString(16).substr(2, 8),
        username: config.username,
        password: config.password
      });

      self.client.on('connect', function() {
        // Subscribe on all modules "statusTopic" topics.
        self.client.subscribe(modulesConfig.map(config => config.statusTopic));

        console.log('Plugin ' + 'mqtt '.yellow.bold + 'connected'.blue);

        // Momentary buttons should all be off to start with.
        for (let module of modulesConfig) {
          if (module.type === 'button momentary') {
            self.client.publish(module.setTopic, module.offCmd);
          }
        }

        self.emit('connect');
      });

      self.client.on('message', function(topic, message) {
        let asString = String(message).toLowerCase(),
            result = {};

        if (asString === 'on') {
          asString = '100';
        } else if (asString === 'off') {
          asString = '0';
        }

        result.level = Number(asString);
        result.isStateOn = !!result.level;
        result.id = modulesConfig.find(mod => mod.statusTopic === topic).id;

        self.emit('change', result);
      });

      self.client.on('error', function(error) {
        console.log(error);
      });
    }
  };

  self.exit = function() {
    if (self.client) {
      self.client.end();
      self.client = null;
    }
  };

  self.getStatus = function(id) {
    console.log('Plugin ' + 'mqtt '.yellow.bold + 'getStatus'.blue, id);
    let moduleConfig = modulesConfig.filter(modConfig => modConfig.id === id)[0];

    if (moduleConfig && moduleConfig.getTopic && moduleConfig.getTopic.length > 0) {
      self.client.publish(moduleConfig.getTopic, '');
    }
  };

  self.switch = function(id, level) {
    console.log('Plugin ' + 'mqtt '.yellow.bold + 'switch'.blue, id, level);
    let moduleConfig = modulesConfig.filter(modConfig => modConfig.id === id)[0];
    self.client.publish(moduleConfig.setTopic, moduleConfig.levelCmd.replace('<level>', String(level)));
  };

  self.toggle = function(id, state) {
    console.log('Plugin ' + 'mqtt '.yellow.bold + 'toggle'.blue, id, state);
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
