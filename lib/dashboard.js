var path = require('path'),
    fs = require('fs-extra');

function Dashboard(options) {
  var self = this;

  console.log('Initalizing Dashboard'.yellow.bold.underline);

  return {

    loadConfig: function(callback) {
      console.log('Loading config ...');
      let configFilename = path.resolve(__dirname + '/../config/config.js');

      try {
        fs.accessSync(configFilename, fs.F_OK);
        let c = require(configFilename);
        let config = Object.assign(c);

        return config;
      } catch (e) {
        if (e.code === 'ENOENT') {

          console.info('No config file found, creating a new one from config/config-sample.js.');
          let templateConfigFilename;
          try {
            templateConfigFilename = path.resolve(__dirname + '/../config/config-sample.js');
            fs.copySync(templateConfigFilename, configFilename);
          } catch (e) {
            console.error(`Failed create file "${configFilename}" from template "${templateConfigFilename}".`);
            process.exit(101);
          }

          try {
            fs.accessSync(configFilename, fs.F_OK);
            var c = require(configFilename);
            var config = Object.assign(c);

            return config;
          } catch (e) {
            console.error('Failed to load or parse config/config.js file, please correct file.');
            process.exit(100);
          }
        } else if (e instanceof ReferenceError || e instanceof SyntaxError) {
          console.error('WARNING! Could not validate config file. Please correct syntax errors.');
          process.exit(98);
        } else {
          console.error('WARNING! Could not load config file. Error found: ' + e);
          process.exit(99);
        }
      }
    },
    setPlugins: function(plugins) {
      self.plugins = plugins;
    },
    setModules: function(modules) {
      self.modules = modules;
    },
    setConfig: function(config) {
      self.config = config;
    },
    getConfig: function() {
      return self.config;
    },
    exit: function() {
      for(var i = 0, length = self.plugins.length; i < length; i++) {
        try {
          self.plugins[i].exit();
        } catch (err) {
          console.error('Got error when closing down plugin.' + err);
        }
      }
    },
    camera : {
      getStatus: function(plugin, id) {
        self.plugins[plugin].getStatus(id);
      },
      getSnapshot: function(plugin, id) {
        self.plugins[plugin].getSnapshot(id);
      },
      getLiveliew: function(plugin, id) {
        self.plugins[plugin].getLiveview(id);
      },
      start: function(plugin) {
        self.plugins[plugin].start();
      },
      on: function(plugin, command, callback) {
        self.plugins[plugin].on(command, callback);
      },
      once: function(plugin, command, callback) {
        self.plugins[plugin].once(command, callback);
      }
    },
    counter : {
      getStatus: function(plugin, id) {
        self.plugins[plugin].getStatus(id);
      },
      start: function(plugin) {
        self.plugins[plugin].start();
      },
      on: function(plugin, command, callback) {
        self.plugins[plugin].on(command, callback);
      },
      once: function(plugin, command, callback) {
        self.plugins[plugin].once(command, callback);
      }
    },
    doorlock: {
      getStatus: function(plugin, alias, area) {
        self.plugins[plugin].getDoorLockStatus(alias, area);
      },
      start: function(plugin) {
        self.plugins[plugin].start();
      },
      on: function(plugin, command, callback) {
        self.plugins[plugin].on(command, callback);
      },
      once: function(plugin, command, callback) {
        self.plugins[plugin].once(command, callback);
      }
    },
    energymeter : {
      getStatus: function(plugin, id) {
        self.plugins[plugin].getStatus(id);
      },
      start: function(plugin) {
        self.plugins[plugin].start();
      },
      on: function(plugin, command, callback) {
        self.plugins[plugin].on(command, callback);
      },
      once: function(plugin, command, callback) {
        self.plugins[plugin].once(command, callback);
      }
    },
    electricity_spot_price: {
      getPriceList: function(plugin, id) {
        self.plugins[plugin].getPriceList(id);
      },
      start: function(plugin) {
        self.plugins[plugin].start();
      },
      on: function(plugin, command, callback) {
        self.plugins[plugin].on(command, callback);
      },
      once: function(plugin, command, callback) {
        self.plugins[plugin].once(command, callback);
      }
    },
    tempmeter : {
      getStatus: function(plugin, id) {
        self.plugins[plugin].getStatus(id);
      },
      start: function(plugin) {
        self.plugins[plugin].start();
      },
      on: function(plugin, command, callback) {
        self.plugins[plugin].on(command, callback);
      },
      once: function(plugin, command, callback) {
        self.plugins[plugin].once(command, callback);
      }
    },
    lights: {
      switch: function(plugin, id, level) {
        self.plugins[plugin].switch(id, level);
      },
      toggle: function(plugin, id, state) {
        self.plugins[plugin].toggle(id, state);
      },
      getStatus: function(plugin, id) {
        self.plugins[plugin].getStatus(id);
      },
      start: function(plugin) {
        self.plugins[plugin].start();
      },
      on: function(plugin, command, callback) {
        self.plugins[plugin].on(command, callback);
      },
      once: function(plugin, command, callback) {
        self.plugins[plugin].once(command, callback);
      }
    },
    mediaplayer: {
      start: function(plugin) {
        self.plugins[plugin].start();
      },
      getStatus: function(plugin, id) {
        self.plugins[plugin].getStatus(id);
      },
      changePlayState:function(plugin, id, state) {
        self.plugins[plugin].changePlayState(id, state);
      },
      trackSeek:function(plugin, id, duration) {
        self.plugins[plugin].trackSeek(id, duration);
      },
      prev:function(plugin, id) {
        self.plugins[plugin].prev(id);
      },
      next:function(plugin, id) {
        self.plugins[plugin].next(id);
      },
      favorite:function(plugin, id, favoriteName) {
        self.plugins[plugin].favorite(id, favoriteName);
      },
      changeVolume:function(plugin, id, volume) {
        self.plugins[plugin].changeVolume(id, volume);
      },
      on: function(plugin, command, callback) {
        self.plugins[plugin].on(command, callback);
      },
      once: function(plugin, command, callback) {
        self.plugins[plugin].once(command, callback);
      }
    },
    remotecontrol: {
      start: function(plugin) {
        self.plugins[plugin].start();
      },
      sendCommand: function(plugin, commands) {
        self.plugins[plugin].sendCommand(commands);
      },
      on: function(plugin, command, callback) {
        self.plugins[plugin].on(command, callback);
      },
      once: function(plugin, command, callback) {
        self.plugins[plugin].once(command, callback);
      }
    },
    calendar: {
      getEvents: function(plugin, url, fetchInterval, maximumEntries, maximumNumberOfDays, user, pass) {
        self.plugins[plugin].getEvents(url, fetchInterval, maximumEntries, maximumNumberOfDays, user, pass);
      },
      start: function(plugin) {
        self.plugins[plugin].start();
      },
      on: function(plugin, command, callback) {
        self.plugins[plugin].on(command, callback);
      },
      once: function(plugin, command, callback) {
        self.plugins[plugin].once(command, callback);
      }
    },
    weather: {
      getCurrent: function(plugin, lat, lon) {
        self.plugins[plugin].getCurrent(lat, lon);
      },
      start: function(plugin) {
        self.plugins[plugin].start();
      },
      on: function(plugin, command, callback) {
        self.plugins[plugin].on(command, callback);
      },
      once: function(plugin, command, callback) {
        self.plugins[plugin].once(command, callback);
      }
    },
    location: {
      start: function(plugin) {
        self.plugins[plugin].start();
      },
      on: function(plugin, command, callback) {
        self.plugins[plugin].on(command, callback);
      },
      once: function(plugin, command, callback) {
        self.plugins[plugin].once(command, callback);
      }
    }
  };
}

module.exports = Dashboard;
