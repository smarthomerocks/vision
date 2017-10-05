# <TBD>

Modulename: <TBD>


## Description

<TBD>


## Config

    {
        module: "<TBD>",
        config: {
          title:    <string>,  // title of the module that should be shown on the dashboard
          section:  <string>,  // which section this modules should be displayed on
          column:   <number>,  // at what column on the section should this module be displayed at, higher value = more to the right of the screen
          row:      <number>,  // at what row on the section should this module be displayed at, higher value = more to the bottom of the screen
          size_x: 1, <number>  // width of module, in number of columns <optional>
          size_y: 2  <number>  // height of module, in number of rows <optional>
        }
    }


### Config example

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


## Screenshots

![announcement with dark theme](doc/announce-dark.png "Announce - dark theme") &nbsp; ![ recording announcement with dark theme](doc/announce-dark-recording.png "Announce - recording announcement") &nbsp; ![announcement with dark theme](doc/announce-light.png "Announce - light theme")


## Author

    <TBD>
