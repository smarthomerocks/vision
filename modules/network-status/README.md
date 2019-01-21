# Network status

Modulename: network-status


## Description

The module is used to visualize the status/connection to a network based service. By periodically sending out requests and monitoring the responses from the service we get an indication wether the service is up and running. If the service is not running we also show the time when the dashboard first noticed that the service was down.


## Config

    {
        module: "network-status",
        config: {
          title:     <string>,  // title of the module that should be shown on the dashboard
	      id:        <string>,  // identifier that uniquely indentifies this module
          type:      <string>,  // type of monitoring used, "http" or "ping" (http uses HTTP GET-requests, ping is using IGMP-Ping requests)
          target:    <string>,  // service we are monitoring, if type is "http" then this is a URL, if type is "ping" this is a hostname or IP-adress
          interval:  <number>,  // delay in milliseconds between the the status checks
          timeout:   <number>,  // time in milliseconds we wait for an response until we signal a failure
          okText:    <string>,  // text we show if service is up and running
          errorText: <string>,  // text we show if service is not running
          column:    <number>,  // at what column on the section should this module be displayed at, higher value = more to the right of the screen
          row:       <number>,  // at what row on the section should this module be displayed at, higher value = more to the bottom of the screen
          size_x: 1, <number>   // width of module, in number of columns <optional>
          size_y: 2  <number>   // height of module, in number of rows <optional>
        }
    }


### Config example

    {
        module: "network-status",
        config: {
          title: "Internet",
          id: "internet",
          type: "http",
          target: "https://www.google.se"
          interval: 5000,
          timeout: 2000,
          okText: "OK",
          errorText: "Not available",          
          column: 2,
          row: 1,
          size_x: 1,
          size_y: 1
        }
    }

## Screenshots



## Author

    Henrik Östman
