var config = {
    ssl: false,
    paths: {
      modules: "/modules"
    },
    sections: [
      {
        section: "start",
        title: "Start",
        margins: [10, 10],
        base_dimensions: [180, 140],
        icon: '<svg fill="#ffffff" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'
      },
      {
        section: "remotecontrol",
        title: "Fjärrkontroll",
        margins: [10, 10],
        base_dimensions: [180, 140],
        icon: '<svg fill="#ffffff" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0V0zm0 0h24v24H0V0z" fill="none"/><path d="M7 7.07L8.43 8.5c.91-.91 2.18-1.48 3.57-1.48s2.66.57 3.57 1.48L17 7.07C15.72 5.79 13.95 5 12 5s-3.72.79-5 2.07zM12 1C8.98 1 6.24 2.23 4.25 4.21l1.41 1.41C7.28 4 9.53 3 12 3s4.72 1 6.34 2.62l1.41-1.41C17.76 2.23 15.02 1 12 1zm2.86 9.01L9.14 10C8.51 10 8 10.51 8 11.14v9.71c0 .63.51 1.14 1.14 1.14h5.71c.63 0 1.14-.51 1.14-1.14v-9.71c.01-.63-.5-1.13-1.13-1.13zM15 20H9v-8h6v8z"/></svg>'
      },
      {
        section: "lights",
        title: "Lampor",
        margins: [10, 10],
        base_dimensions: [180, 140],
        icon: '<svg fill="#ffffff" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><path d="M0 0h24v24H0V0z" id="a"/></defs><clipPath id="b"><use overflow="visible" xlink:href="#a"/></clipPath><path clip-path="url(#b)" d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/></svg>'
      },
      {
        section: "cameras",
        title: "Kameror",
        margins: [10, 10],
        base_dimensions: [180, 140],
        icon: '<svg fill="#ffffff" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>'
      }
    ],
    plugins: {
      "domoticz": {
        host: "192.168.1.127",
        log: false
      },
      "sonos": {
        timeout: 2000
      },
      "owntracks": {
        host: "192.168.0.39"
      },
      "itach": {
        host: "192.168.1.127",
        hardwares: {
          tv: {
            module: "1:3",
            commands: "samsung-tv.json"
          },
          tvBox: {
            module: "1:3",
            commands: "motorola-vip-1003-iptv.json"
          },
          receiver: {
            module: "1:2",
            commands: "yamaha-rxv-main-zone-pre-2009.json"
          },
          appleTv: {
            module: "1:2",
            commands: "apple-tv.json"
          },
          nexa110: {
            module: "1:1",
            commands: "nexa-self-learn-110.json"
          }
        }
      }
    },
    modules: [
      {
        module: "announce", // Requires SSL
        config: {
          title: 'Hela huset',
          path: '/home/pi/Downloads/node-sonos-http-api/static/clips',
          url: 'http://192.168.0.39:5005', // node-sonos-http-api
          volume: 80,
          room: 'Bärbar',
          section: "start",
          column: 1,
          row: 1
        }
      },
      {
        module: "clock",
        config: {
          section: "start",
          column: 1,
          row: 6
        }
      },
      {
        module: "light-switch",
        config: {
          title: "Fasad",
          plugin: "domoticz",
          id: 1,
          section: "start",
          column: 2,
          row: 1,
          size_x: 1,
          size_y: 1
        }
      },
      {
        module: "energy-meter",
        config: {
          title: "Energiförbrukning",
          plugin: "domoticz",
          id: 4,
          section: "start",
          column: 3,
          row: 3,
          size_x: 1,
          size_y: 1
        }
      },
      {
        module: "light-switch",
        config: {
          title: "Fönster",
          plugin: "domoticz",
          id: 13,
          section: "start",
          column: 2,
          row: 2,
          size_x: 1,
          size_y: 1
        }
      },
      {
        module: "mediaplayer",
        config: {
          title: "Bärbar",
          plugin: "sonos",
          devicename: "Kontor 2",
          section: "start",
          column: 3,
          row: 1,
          size_x: 2,
          size_y: 2
        }
      },
      {
        module: "mediaplayer-favorite",
        config: {
          title: "Pop",
          plugin: "sonos",
          devicename: "Bärbar",
          favoriteName: "Trending Top 40",
          section: "start",
          column: 4,
          row: 3,
          size_x: 1,
          size_y: 1
        }
      },
      {
        module: "map",
        config: {
          plugin: "owntracks",
          section: "start",
          column: 1,
          row: 1,
          size_x: 1,
          size_y: 2
          apiKey: "AIzaSyDLhANkVJDuBCpsZfOq8QJDsi17W36mMaQ",
          markers: {
            "emil_mob": {
              title: "Emil",
      				color: "255, 0, 0"
            }
          }
        }
      },
      {
        module: "apple-tv-remote",
        config: {
          title: "Apple TV",
          plugin: "itach",
          section: "remotecontrol",
          column: 1,
          row: 1,
          size_x: 1,
          size_y: 2
          buttons: {
            up: [{
              hardware: "appleTv",
              command: "CURSOR UP"
            }],
            down: [{
              hardware: "appleTv",
              command: "CURSOR DOWN"
            }],
            left: [{
              hardware: "appleTv",
              command: "CURSOR LEFT"
            }],
            right: [{
              hardware: "appleTv",
              command: "CURSOR RIGHT"
            }],
            enter: [{
              hardware: "appleTv",
              command: "CURSOR ENTER"
            }],
            menu: [{
              hardware: "appleTv",
              command: "MENU MAIN"
            }],
            play: [{
              hardware: "appleTv",
              command: "PLAY PAUSE TOGGLE"
            }]
          }
        }
      }
    ]
  };

if (typeof module !== 'undefined') {module.exports = config;}
