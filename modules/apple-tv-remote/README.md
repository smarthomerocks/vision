# <TBD>

Modulename: <TBD>


## Description

<TBD>


## Config

    {
        module: "<TBD>",
        config: {
          title:    <string>,  // title of the module that should be shown on the dashboard
          column:   <number>,  // at what column on the section should this module be displayed at, higher value = more to the right of the screen
          row:      <number>,  // at what row on the section should this module be displayed at, higher value = more to the bottom of the screen
          size_x: 1, <number>  // width of module, in number of columns <optional>
          size_y: 2  <number>  // height of module, in number of rows <optional>
        }
    }


### Config example

    {
        module: "apple-tv-remote",
        config: {
            title: "Apple TV",
            plugin: "itach",
            column: 1,
            row: 1,
            size_x: 1,
            size_y: 2,
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


## Screenshots

![announcement with dark theme](doc/announce-dark.png "Announce - dark theme") &nbsp; ![ recording announcement with dark theme](doc/announce-dark-recording.png "Announce - recording announcement") &nbsp; ![announcement with dark theme](doc/announce-light.png "Announce - light theme")


## Author

    <TBD>
