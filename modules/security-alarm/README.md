# <TBD>

Modulename: securty-alarm


## Description

A module used for viewing current alarm status from security alarm.



## Config

    {
        module: "securty-alarm",
        config: {
            title:     <string>,    // title of the module that should be shown on the dashboard
            plugin:    <string>,    // plugin used for this modules
            alias:     <string>,    // name of the alias for the location of the lock 
            column:    <number>,    // at what column on the section should this module be displayed at, higher value = more to the right of the screen
            row:       <number>,    // at what row on the section should this module be displayed at, higher value = more to the bottom of the screen
            size_x: 1  <number>,    // width of module, in number of columns <optional>
            size_y: 2  <number>     // height of module, in number of rows <optional>
        }
    }


### Config example

    {
        module: "securty-alarm",
        config: {
          title: "Larm",
          plugin: "verisure",
          alias: "Kodarvägen",
          column: 1,
          row: 1,
          size_x: 1,
          size_y: 1
        }
    }

## Screenshots

![armed with dark theme](doc/security-alarm-dark-armed.png "Armed - dark theme") &nbsp; ![armed home with dark theme](doc/security-alarm-dark-armed-home.png "Armed home- dark theme") &nbsp; ![armed with light theme](doc/security-alarm-light-armed.png "Armed - light theme") &nbsp; ![ unarmed with light theme](doc/security-alarm-light-unarmed.png "Unarmed - light theme") 


## Author

    Jonas Ingermaa
