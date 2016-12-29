Dashboard och fjärrkontroll för hela hemmet.

* [Bakgrund till projektet](background)
* [Förslag på arkitektur](arkitektur)

![Screenshot](/uploads/6393dba9bc6b6b5734e5ef5fbc2433b0/Screenshot.png)

# Install

1. npm install
2. npm start
3. Goto http://localhost:3003

## Domoticz and MQTT

1. Install MQTT Broker (apt-get install mosquitto)
2. Configure MQTT Hardware in Domoticz (Setup -> Hardware -> Type: MQTT Client Gateway)
3. Update options /plugins/domoticz/domoticz.js to fit your setup (host and idx)
