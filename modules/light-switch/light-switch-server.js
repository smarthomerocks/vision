function LightSwitch(Dashboard, app, io) {
	var _socket,
			socketList = [];
      lightSwitchOn = false,
      config = {
        lightSwitchId: 1,
        plugin: 'domoticz'
      };

	function connectSocket() {
		var nsp = io.of('/light-switch');

		nsp.on('connection', function(socket) {
			_socket = socket;
			socketList.push(socket);

			console.log('Connected');

			var onevent = socket.onevent;
			socket.onevent = function (packet) {
			    var args = packet.data || [];
			    onevent.call(this, packet);    	// original call
			    packet.data = ["*"].concat(args);
			    onevent.call(this, packet);     // additional call to catch-all
			};

			socket.on('*', function(command, data) {
				console.log('LightSwitch', command, data);

				onSocketUpdate(command, data);
			});

			socket.on('close', function () {
      	socketlist.splice(socketlist.indexOf(socket), 1);
    	});

			socket.emit('connected');
		});
	}

	function onSocketUpdate(command, data) {
		if (command === 'LIGHT_SWITCH_TOGGLE') {
      console.log('LIGHT_SWITCH_TOGGLE');
      Dashboard.lights.toggle(config.plugin, config.lightSwitchId, !lightSwitchOn);
		} else if (command === 'LIGHT_SWITCH_STATUS') {
		  console.log('LIGHT_SWITCH_STATUS');
      Dashboard.lights.getStatus(config.plugin, config.lightSwitchId);
		}
	}

  function sendStatus(isStateOn) {
    if (_socket) {
      _socket.emit('LIGHT_SWITCH_STATUS', { isStateOn: isStateOn });
    }
  }

  function connectPlugin() {
    Dashboard.lights.on(config.plugin, 'connect', function(data) {
      Dashboard.lights.getStatus(config.plugin, config.lightSwitchId);
    });

    Dashboard.lights.on(config.plugin, 'change', function(data) {
      lightSwitchOn = data.isStateOn;
      sendStatus(data.isStateOn);
    });

    Dashboard.lights.start(config.plugin);
  }

	function exit() {
		console.log('Exit light-switch');
		socketlist.forEach(function(socket) {
			console.log('Closing light-switch socket');
		  socket.close();
		});
	}

	connectSocket();
  connectPlugin();

	console.log('LIGHTSWITCH started');

	return {
		exit: exit
	}
}

module.exports = {
	create: function(Dashboard, app, io) {
		return new LightSwitch(Dashboard, app, io);
	}
};
