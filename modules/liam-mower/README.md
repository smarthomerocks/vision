# Liam mower

Modulename: liam-mower


## Description

Module for controlling an [Liam-ESP](https://github.com/trycoon/liam-esp) robot mower.
Basic support for setting and viewing current state, monitoring battery level and so forth.

## Config

    {
        module: "liam-mower",
        config: {
          title:     <string>,  // title of the module that should be shown on the dashboard
          plugin:    <string>,  // plugin to use with this module
	        id:        <string>,  // identifier that uniquely indentifies this module to the plugin
	        setTopic:  <string>,  // Topic that should be used to set the mower to a new state
          statusTopic: <string>,// Topic the mower use to report back state changes
          column:    <number>,  // at what column on the section should this module be displayed at, higher value = more to the right of the screen
          row:       <number>,  // at what row on the section should this module be displayed at, higher value = more to the bottom of the screen
          size_x: 1, <number>  // width of module, in number of columns <optional>
          size_y: 2  <number>  // height of module, in number of rows <optional>
        }
    }


### Config example

    {
        module: "liam-mower",
        config: {
          title: "Liam",
          plugin: "mqtt",
          id: "liam1",
          setTopic: "home/liam-esp/command",
          statusTopic: "home/liam-esp/subscribe",
          column: 2,
          row: 1,
          size_x: 4,
          size_y: 4
        }
    }

## Screenshots

<TBD>


## Author

    Henrik Östman
