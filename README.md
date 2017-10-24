# node-smart-remote

Easy to use Dashboard for Home automation

* [Background to application](https://gitlab.com/emilohman/node-smart-remote/wikis/background)
* [Application architecture](https://gitlab.com/emilohman/node-smart-remote/wikis/arkitektur)


![Screenshot](/uploads/6393dba9bc6b6b5734e5ef5fbc2433b0/Screenshot.png)


# Install

1. Download and install [Node.js](https://nodejs.org)
2. Run "npm install" in the application folder
3. Copy "config/config-sample.js" to "config/config.js"
4. Edit "config/config.js" and make your required settings. See the "README.md" files of the modules and plugins you want to use for example configurations
5. Run "npm start"
6. Point your web browser to [http://localhost:3003](http://localhost:3003)

## Domoticz and MQTT

1. Install MQTT Broker (apt-get install mosquitto or brew install mosquitto) 
2. Configure MQTT Hardware in Domoticz (Setup -> Hardware -> Type: MQTT Client Gateway)
3. Update options /plugins/domoticz/domoticz.js to fit your setup (host and idx)

## Hosting the application on a Raspberry Pi

[Hosting node-smart-remote](hosting/README.md)
