function LightSwitch(Dashboard, app, io) {
	var socketList = [];

	function connectSocket() {
		var nsp = io.of('/light-switch');

		nsp.on('connection', function(socket) {
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

			function onSocketUpdate(command, data) {
				if (command === 'LIGHT_SWITCH_CONNECT') {
					console.log('LIGHT_SWITCH_CONNECT');
					connectPlugin(data.plugin);
				} else if (command === 'LIGHT_SWITCH_TOGGLE') {
		      console.log('LIGHT_SWITCH_TOGGLE');
		      Dashboard.lights.toggle(data.plugin, data.id, data.stateOn);
				} else if (command === 'LIGHT_SWITCH_STATUS') {
				  console.log('LIGHT_SWITCH_STATUS');
		      Dashboard.lights.getStatus(data.plugin, data.id);
				}
			}

		  function sendStatus(id, isStateOn) {
		    socket.emit('LIGHT_SWITCH_STATUS', { id: id, isStateOn: isStateOn });
		  }

		  function connectPlugin(plugin) {
		    Dashboard.lights.on(plugin, 'connect', function(data) {
					socket.emit('LIGHT_SWITCH_CONNECTED');
		    });

		    Dashboard.lights.on(plugin, 'change', function(data) {
		      sendStatus(data.id, data.isStateOn);
		    });

		    Dashboard.lights.start(plugin);
		  }
		});
	}

	function exit() {
		console.log('Exit light-switch');
		socketlist.forEach(function(socket) {
			console.log('Closing light-switch socket');
		  socket.close();
		});
	}

	connectSocket();

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
