# MQTT

Plugin name: mqtt

## Description

Generic plugin for communicating with devices through a MQTT broker, for example [Mosquitto](https://mosquitto.org/).

## Tested hardware

[Sonoff 4CH](https://www.itead.cc/wiki/Sonoff_4CH)

[Homebuilt LED-controller](https://github.com/trycoon/ledstripe-controller)


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

    Henrik Östman
