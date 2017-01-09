var config = {
    paths: {
      modules: "/modules"
    },
    plugins: {
      "domoticz": {
        host: "192.168.1.127",
        log: false
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
        module: "light-switch",
        config: {
          title: "Fönster",
          plugin: "domoticz",
          id: 3
        }
      }
    ]
  };

if (typeof module !== 'undefined') {module.exports = config;}
