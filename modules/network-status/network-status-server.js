const ModuleServer = require('../../lib/module-server.js'),
      got = require('got');


module.exports = ModuleServer.create({
 
  monitoringHosts: [],

  socketNotificationReceived: function(command, config) {
    if (command === 'NETWORK-STATUS_CONNECT') {
      this.setup(config);
    }
  },

  setup: function(config) {
    
    // check if we already monitor host.
    if (config && config.target && this.monitoringHosts.some(monitor => monitor.config.target === config.target)) {
      this.sendSocketNotification('NETWORK-STATUS_CONNECTED');
      return;
    }

    this.sendSocketNotification('NETWORK-STATUS_CONNECTED');

    let monitorHost = {
      config: config
    };

    monitorHost.interval = setInterval(() => {
      monitorHost.config.type === 'http' ? this.makeHttpRequest(monitorHost) : this.makePingRequest(monitorHost);
    }, monitorHost.config.interval, monitorHost);

    this.monitoringHosts.push(monitorHost);

    config.type === 'http' ? this.makeHttpRequest(monitorHost) : this.makePingRequest(monitorHost);
  },

  makeHttpRequest(monitorHost) {
    (async (monitorHost) => { 
      try {
        //https://www.npmjs.com/package/got
        await got(monitorHost.config.target, {
          timeout: monitorHost.config.timeout
        });
        // remember when we last change state.
        if (!monitorHost.available) {
          monitorHost.lastChange = new Date();
        }

        monitorHost.available = true;
        this.sendSocketNotification('NETWORK-STATUS_STATUS', { id: monitorHost.config.id, since: monitorHost.lastChange, available: monitorHost.available });
      
      } catch(error) {
        // remember when we last change state.
        if (monitorHost.available) {
          monitorHost.lastChange = new Date();
        }

        monitorHost.available = false;
        this.sendSocketNotification('NETWORK-STATUS_STATUS', { id: monitorHost.config.id, since: monitorHost.lastChange, available: monitorHost.available });
      }
    })(monitorHost);
  },

  makePingRequest(config, monitorHost) {
    // TBD
    //https://www.npmjs.com/package/net-ping
  }
});
