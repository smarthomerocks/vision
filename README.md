# node-smart-remote

Dashboard och fjärrkontroll för hela hemmet.

* [Bakgrund till projektet](https://gitlab.com/emilohman/node-smart-remote/wikis/background)
* [Förslag på arkitektur](https://gitlab.com/emilohman/node-smart-remote/wikis/arkitektur)


![Screenshot](/uploads/6393dba9bc6b6b5734e5ef5fbc2433b0/Screenshot.png)


# Install

Create config file config/config.js. See config/config-sample.js

1. npm install
2. npm start
3. Goto http://localhost:3003

## Domoticz and MQTT

1. Install MQTT Broker (apt-get install mosquitto or brew install mosquitto) 
2. Configure MQTT Hardware in Domoticz (Setup -> Hardware -> Type: MQTT Client Gateway)
3. Update options /plugins/domoticz/domoticz.js to fit your setup (host and idx)
