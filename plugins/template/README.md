# Template

Plugin name: template

## Description

Here goes a description of the plugin, what it is used for, and other things the users should know.

## Tested hardware

A list of hardwares where applicable goes here, please also add links to datasheets and manufacturer pages for more information.
e.g. [Sonoff 4CH](https://www.itead.cc/wiki/Sonoff_4CH)


## Config

    "mqtt": {
        host: <string>,        // URL to MQTT broker server, must include protocol
        port: <number>,        // portnumber for MQTT broker server, 1883 is MQTT standard port
        username: <string>,    // optional username if required by MQTT broker
        password: <string>     // optional password if required by MQTT broker
    }


### Config example

    "mqtt": {
        host: "mqtt://192.168.10.100",
        port: 1883,
        username: "my username",
        password: "my password"
    }

## Author

    Your name
