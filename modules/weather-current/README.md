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

{
        module: "weather-current",
        config: {
          title: "Visby",
          plugin: "smhi",
          lat: '57.634800',
          lon: '18.294840',
          section: "start",
          column: 3,
          row: 1,
          size_x: 1,
          size_y: 1
        }
      }

## Screenshots

![announcement with dark theme](doc/announce-dark.png "Announce - dark theme") &nbsp; ![ recording announcement with dark theme](doc/announce-dark-recording.png "Announce - recording announcement") &nbsp; ![announcement with dark theme](doc/announce-light.png "Announce - light theme")


## Author

    <TBD>
