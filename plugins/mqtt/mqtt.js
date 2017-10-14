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
        clientId: "dashboard_" + Math.random().toString(16).substr(2, 8),
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
        json = JSON.parse(message);

        self.emit('change', {id: json.id, level: json.level, isStateOn: !!json.level});
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
    self.client.publish(moduleConfig.getTopic, '{}');
  };

  self.switch = function(id, level) {
    console.log('Plugin ' + 'mqtt '.yellow.bold + 'switch'.blue, id, level);
    let moduleConfig = modulesConfig.filter(modConfig => modConfig.id === id)[0];
    self.client.publish(moduleConfig.setTopic, moduleConfig.levelCmd.replace('<level>', string(level)));
  };

  self.toggle = function(id, state) {
    console.log('Plugin ' + 'mqtt '.yellow.bold + 'toggle'.blue, id, state);
    let moduleConfig = modulesConfig.filter(modConfig => modConfig.id === id)[0];
    self.client.publish(moduleConfig.setTopic, state ? moduleConfig.onCmd : moduleConfig.offCmd);

  };
};

util.inherits(MQTT, EventEmitter);

module.exports = {
	create: function(Dashboard, app, io, config) {
		return new MQTT(Dashboard, app, io, config);
	}
};
