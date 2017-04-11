var config = {
    ssl: false,
    theme: 'default',
    paths: {
      modules: "/modules"
    },
    sections: [
      {
        section: "start",
        title: "Start",
        margins: [10, 10],
        base_dimensions: [180, 140],
        icon: 'home'
      },
      {
        section: "remotecontrol",
        title: "Fjärrkontroll",
        margins: [10, 10],
        base_dimensions: [180, 140],
        icon: 'speaker_phone'
      },
      {
        section: "lights",
        title: "Lampor",
        margins: [10, 10],
        base_dimensions: [180, 140],
        icon: 'lightbulb_outline'
      },
      {
        section: "cameras",
        title: "Kameror",
        margins: [10, 10],
        base_dimensions: [180, 140],
        icon: 'videocam'
      }
    ],
    plugins: {
      "domoticz": {
        host: "192.168.1.127",
        httpport: 8080,
        log: false
      },
      "sonos": {
        timeout: 2000
      },
      "owntracks": {
        host: "192.168.0.39"
      },
      "ical": {},
      "smhi": {
        fetchInterval: 300000
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
        module: "calendar",
        config: {
          title: "Kalender",
          plugin: "ical",
          url: 'https://calendar.google.com/calendar/ical/.../basic.ics',
          section: "start",
          column: 5,
          row: 1,
          size_x: 1,
          size_y: 2
        }
      },
      {
        module: "weather-current",
        config: {
          title: "Visby",
          plugin: "smhi",
          lat: '57.634800',
          lon: '18.294840',
          section: "start",
          column: 5,
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
          size_y: 2,
          apiKey: "AIzaSyDLhANkVJDuBCpsZfOq8QJDsi17W36mMaQ",
          markers: {
            "emil_mob": {
              title: "Emil",
      				color: "255, 0, 0"
            }
          }
        }
      }
    ]
  };

if (typeof module !== 'undefined') {module.exports = config;}
