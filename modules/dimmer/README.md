# Dimmer

Modulename: dimmer


## Description

Dimmer that could be used to fade lights or variable control other devices.


## Config

    {
        module: "dimmer",
        config: {
          title:     <string>,  // title of the module that should be shown on the dashboard
          plugin:    <string>,  // plugin to use with this module
	  id:        <string>,  // identifier that uniquely indentifies this module to the plugin
	  readonly:  <boolean>, // the switch can not be modified
          type:      <string>,  // type of dimmer, "slider" or "pot"
          setTopic:  <string>,  // MQTT topic that should be used to set the level of the dimmer
          getTopic:  <string>,  // MQTT topic that should be used to get the current level of the dimmer
          statusTopic: <string>,// MQTT topic the dimmer use to report back state changes
          levelCmd:  <string>,  // command that should be sent to the "setTopic"-topic for changing the level of the dimmer
          maxLevel:  <number>,  // value that represent te highest value the dimmer can take (fully on)
          minLevel:  <number>,  // value that represent te lowest value the dimmer can take (fully off)
          section:   <string>,  // which section this modules should be displayed on
          column:    <number>,  // at what column on the section should this module be displayed at, higher value = more to the right of the screen
          row:       <number>,  // at what row on the section should this module be displayed at, higher value = more to the bottom of the screen
          size_x: 1, <number>  // width of module, in number of columns <optional>
          size_y: 2  <number>  // height of module, in number of rows <optional>
        }
    }


### Config example

{
        module: "dimmer",
        config: {
          title: "Wardrobe light",
          plugin: "mqtt",
          id: "1",
          readonly: false,
          type: "pot",
          setTopic: "home/entrance-wardrobe/setlightlevel",
          getTopic: "home/entrance-wardrobe/getlightlevel",
          statusTopic: "home/entrance-wardrobe/lightlevel",
          levelCmd: '{"level": <level>}',
          maxLevel: 100,
          minLevel: 0,
          section: "start",
          column: 2,
          row: 1,
          size_x: 1,
          size_y: 1
        }
      }

## Screenshots

![dimmer with dark theme](doc/dimmer-dark.png "Dimmer - dark theme") &nbsp; ![dimmer with light theme](doc/dimmer-light.png "Dimmer - light theme")


## Author

    Henrik Östman
