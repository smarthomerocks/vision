# Camera ONVIF

Modulename: camera-onvif


## Description

Support for network based cameras that follows the [ONVIF](https://www.onvif.org/) standard.


## Config

    {
        module: "camera-onvif",
        config: {
            plugin:     <string>,   // plugin to use with this module
            id:         <string>,   // id of camera (could be IP-adderess in some cases)
            username:   <string>,   // username to access camera
            password:   <string>,   // password to access camera
            streaming:  <boolean>,  // if streaming video from camera should be used, otherwise pictures will be taken at intervals
            title:      <string>,   // title of the module that should be shown on the dashboard
            column:     <number>,   // at what column on the section should this module be displayed at, higher value = more to the right of the screen
            row:        <number>,   // at what row on the section should this module be displayed at, higher value = more to the bottom of the screen
            size_x: 1,  <number>    // width of module, in number of columns <optional>
            size_y: 2   <number>    // height of module, in number of rows <optional>
        }
    }


### Config example

    {
        module: "camera-onvif",
        config: {
            plugin: "onvif",
            id: "192.168.10.59",
            username: "admin",
            password: "admin",
            streaming: false,
            title: "nursery",
            column: 1,
            row: 2,
            size_x: 2,
            size_y: 2
        }
    }

## Screenshots

![camera with dark theme](doc/camera-dark.png "Camera - dark theme") &nbsp; ![camera with light theme](doc/camera-light.png "Camera - light theme")


## Author

    Henrik Östman
