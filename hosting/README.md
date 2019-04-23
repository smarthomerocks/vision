# Vision - hosting

Soo you got the application running on your desktop or laptop computer? That's very nice, but in the long run you probably want to host it on a dedicated server so that you could turn of your computer once in a while.
A cheap and power efficient single-board computer as the [Raspberry Pi 2/3](https://en.wikipedia.org/wiki/Raspberry_Pi) would be perfect for the job, loaded with a suitable operatingsystem like [Raspbian lite](https://www.raspberrypi.org/downloads/raspbian/) or [Hypriot (if you choose the Docker path)](https://blog.hypriot.com/downloads/).

There is currently two ways of running the application on a Linux-based operatingsystem, those of you with skills could probably think of more.

***NOTE! the following sections assumes that you are running as root-user, become root-user by running "sudo -i".***
<br>
<br>

---

## Systemd

This option is for you that have a Raspbian system running and just want to install the application among the other applications you may already have running.
It will start the application at boot-time as a systemd-service and try to restart the application in case of a crash.

First install Node.js and some required packages (in case you have not already done that)

    1. sudo apt-get update
    2. apt-get install git curl
    2. curl -sL https://deb.nodesource.com/setup_11.x | bash -
    3. apt-get install -y nodejs
    4. verify with "node -v"

Then download and install Vision

    1. cd /opt
    2. git clone https://github.com/smarthomerocks/vision.git
    3. npm install --production

Lastly we need to enable and start the service, [Understanding systemd](https://www.linux.com/learn/understanding-and-using-systemd)

    1. cp /opt/vision/hosting/systemd/vision.service /etc/systemd/system
    2. systemctl enable vision.service
    3. systemctl start vision.service

Now all should be up and running, verify by using a webbrowser to "IP address to your raspberry-server":80

(find out the IP address by running "ifconfig" on the server)

<br>
<br>

---

## Docker

For those of you that want to run multiple applications on a single Raspbeery Pi server but still want to have applications isolated for minimal interference, Docker is a viable solution.
[What is Docker](https://www.docker.com/what-container)

First install Docker if that has not already been done, if starting from a clean system I would suggest that you use the [Hypriot-image](https://blog.hypriot.com/downloads/) instead of [Raspbian](https://www.raspberrypi.org/downloads/raspbian/), since it has Docker preinstalled.

<br>

### Raspberry Pi

#### Building

Build a Docker image if you don't have one already (see #4 in Running for a prebuilt version!)

    1. git clone https://github.com/smarthomerocks/vision.git && cd vision
    2. docker build -t vision -f hosting/docker/Dockerfile.rpi .

#### Running

Start the Docker image, the configuration file will be located in the /etc/vision directory on your host computer.

    1. mkdir -p /etc/vision
    2. cp config/config-sample.js /etc/vision/config.js
    3. docker run -d -v /etc/vision:/home/node/config -p 80:3003 -p 443:3444 --restart unless-stopped vision
    4. if you don't want to build an image youself you could use a prebuilt version:
    docker run -d -v /etc/vision:/home/node/config -p 80:3003 -p 443:3444 --restart unless-stopped --name vision smarthomerocks/vision
    
Now all should be up and running, verify by using a webbrowser to \<IP address to your raspberry-server>

(find out the IP address by running "ifconfig" on the server)

<br>

### X64 (PC)

#### Building

Build a Docker image if you don't have one already (see #4 in Running for a prebuilt version!)

    1. git clone https://github.com/smarthomerocks/vision.git && cd vision
    2. docker build -t vision -f hosting/docker/Dockerfile.x64 .

#### Running

Start the Docker image, the configuration file will be located in the /etc/vision directory on your host computer.

    1. mkdir -p /etc/vision
    2. cp config/config-sample.js /etc/vision/config.js
    3. docker run -d -v /etc/vision:/home/node/config -p 80:3003 -p 443:3444 --restart unless-stopped vision
    4. if you don't want to build an image youself you could use a prebuilt version:
    docker run -d -v /etc/vision:/home/node/config -p 80:3003 -p 443:3444 --restart unless-stopped --name vision smarthomerocks/vision

Now all should be up and running, verify by using a webbrowser to \<IP address to your raspberry-server>

(find out the IP address by running "ifconfig" on the server)