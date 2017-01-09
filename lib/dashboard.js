var root = process.cwd(),
		path = require('path'),
    fs = require("fs");


function Dashboard(options) {
  var self = this;

  return {

    loadConfig: function(callback) {
      console.log("Loading config ...");
      var configFilename = path.resolve(root + "/config/config.js");
      try {
        fs.accessSync(configFilename, fs.F_OK);
        var c = require(configFilename);
        var config = Object.assign(c);
				//console.log(JSON.stringify(config));
        return config;
      } catch (e) {
        if (e.code == "ENOENT") {
          console.error("WARNING! Could not find config file. Please create one.");
        } else if (e instanceof ReferenceError || e instanceof SyntaxError) {
          console.error("WARNING! Could not validate config file. Please correct syntax errors.");
        } else {
          console.error("WARNING! Could not load config file.  Error found: " + e);
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
      for(var i = 0, length = self.modules.length; i < length; i++) {
        self.modules[i].exit();
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
      }
    }
  };
}

module.exports = Dashboard;
