var config = {
    paths: {
      modules: "/modules"
    },
    plugins: {
      "domoticz": {
        host: "192.168.1.127",
        log: false
      },
      "sonos": {
        timeout: 2000
      }
    },
    modules: [
      {
        module: "light-switch",
        config: {
          title: "Fasad",
          plugin: "domoticz",
          id: 1
        }
      },
      {
        module: "energy-meter",
        config: {
          title: "Energiförbrukning",
          plugin: "domoticz",
          id: 4
        }
      },
      {
        module: "light-switch",
        config: {
          title: "Fönster",
          plugin: "domoticz",
          id: 3
        }
      },
      {
        module: "mediaplayer",
        config: {
          title: "Kontor",
          plugin: "sonos",
          devicename: "Kontor 2"
        }
      }
    ]
  };

if (typeof module !== 'undefined') {module.exports = config;}
