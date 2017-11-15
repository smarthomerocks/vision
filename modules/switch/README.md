# Switch

Modulename: switch


## Description

Generic switch that could be used to switch lights and other things on and off.
Several options are available for customizing the look and functionallity of the switch.

## Config

    {
        module: "switch",
        config: {
          title:     <string>,  // title of the module that should be shown on the dashboard
          plugin:    <string>,  // plugin to use with this module
	      id:        <string>,  // identifier that uniquely indentifies this module to the plugin
	      readonly:  <boolean>, // the switch can not be modified
          type:      <string>,  // type of switch, "button" or "button momentary" (turns off as soon as you release the button)
          setTopic:  <string>,  // MQTT topic that should be used to set the switch to a new state
          getTopic:  <string>,  // MQTT topic that should be used to get the current state of the switch
          statusTopic: <string>,// MQTT topic the switch use to report back state changes
          onCmd:     <string>,  // command that should be sent to the "setTopic"-topic for turning the switch on
          offCmd:    <string>,  // command that should be sent to the "setTopic"-topic for turning the switch off
          icon:      <string>,  // icon for button
          section:   <string>,  // which section this modules should be displayed on
          column:    <number>,  // at what column on the section should this module be displayed at, higher value = more to the right of the screen
          row:       <number>,  // at what row on the section should this module be displayed at, higher value = more to the bottom of the screen
          size_x: 1, <number>  // width of module, in number of columns <optional>
          size_y: 2  <number>  // height of module, in number of rows <optional>
        }
    }


### Config example

{
        module: "switch",
        config: {
          title: "Kitchen light",
          plugin: "mqtt",
          id: "1",
          readonly: false,
          type: "button",
          setTopic: "home/kitchen/setlightlevel",
          getTopic: "home/kitchen/getlightlevel",
          statusTopic: "home/kitchen/lightlevel",
          onCmd: '{"level": 100}',
          offCmd: '{"level": 0}',
          section: "start",
          column: 2,
          row: 1,
          size_x: 1,
          size_y: 1
        }
      }

## Screenshots

![switch with dark theme](doc/switch-dark.png "Switch - dark theme") &nbsp; ![switch with light theme](doc/switch-light.png "Switch - light theme")


## Author

    <TBD>, Henrik Östman
