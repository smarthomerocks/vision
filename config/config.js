var config = {
    paths: {
      modules: ""
    },
    plugins: {
      "domoticz": {
        host: "192.168.0.39",
        idx: [1, 13]
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
      }
    ]
  };

if (typeof module !== 'undefined') {module.exports = config;}
