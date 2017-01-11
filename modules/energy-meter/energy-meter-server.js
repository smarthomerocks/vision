function EnergyMeter(Dashboard, app, io) {
	var socketList = [];

	function connectSocket() {
		var nsp = io.of('/energy-meter');

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
				console.log('Energy meter', command, data);

				onSocketUpdate(command, data);
			});

			socket.on('close', function () {
      	socketlist.splice(socketlist.indexOf(socket), 1);
    	});

			socket.emit('connected');

			function onSocketUpdate(command, data) {
				if (command === 'ENERGY_METER_CONNECT') {
					console.log('ENERGY_METER_CONNECT');
					connectPlugin(data.plugin);
				} else if (command === 'ENERGY_METER_STATUS') {
				  console.log('ENERGY_METER_STATUS');
		      Dashboard.energymeter.getStatus(data.plugin, data.id);
				}
			}

		  function sendStatus(id, value, value_extra) {
		    socket.emit('ENERGY_METER_STATUS', { id: id, current:value, today:value_extra });
		  }

		  function connectPlugin(plugin) {
		    Dashboard.energymeter.on(plugin, 'connect', function(data) {
					socket.emit('ENERGY_METER_CONNECTED');
		    });

		    Dashboard.energymeter.on(plugin, 'change', function(data) {
		      sendStatus(data.id, data.value, data.value_extra);
		    });

		    Dashboard.energymeter.start(plugin);
		  }
		});
	}

	function exit() {
		console.log('Exit energy-meter');
		socketlist.forEach(function(socket) {
			console.log('Closing energy-meter socket');
		  socket.close();
		});
	}

	connectSocket();

	console.log('ENERGYMETER started');

	return {
		exit: exit
	}
}

module.exports = {
	create: function(Dashboard, app, io) {
		return new EnergyMeter(Dashboard, app, io);
	}
};
