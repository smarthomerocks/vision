function Dashboard(options) {
  var self = this;

  return {
    setPlugins: function(plugins) {
      self.plugins = plugins;
    },
    setModules: function(modules) {
      self.modules = modules;
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
