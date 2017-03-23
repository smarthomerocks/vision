function TemperatureMeter(Dashboard, app, io) {
	var socketList = [];

	function connectSocket() {
		var nsp = io.of('/temperature-meter');

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
				console.log('Temperature meter', command, data);

				onSocketUpdate(command, data);
			});

			socket.on('close', function () {
      	socketlist.splice(socketlist.indexOf(socket), 1);
    	});

			socket.emit('connected');

			function onSocketUpdate(command, data) {
				if (command === 'TEMP_METER_CONNECT') {
					console.log('TEMP_METER_CONNECT');
					connectPlugin(data.plugin);
				} else if (command === 'TEMP_METER_STATUS') {
				  console.log('TEMP_METER_STATUS');
		      Dashboard.tempmeter.getStatus(data.plugin, data.id);
				}
			}

		  function sendStatus(id, value, value_extra) {
		    socket.emit('TEMP_METER_STATUS', { id: id, current:value, today:value_extra });
		  }

		  function connectPlugin(plugin) {
		    Dashboard.tempmeter.on(plugin, 'connect', function(data) {
					socket.emit('TEMP_METER_CONNECTED');
		    });

		    Dashboard.tempmeter.on(plugin, 'change', function(data) {
		      sendStatus(data.id, data.value, data.value_extra);
		    });

		    Dashboard.tempmeter.start(plugin);
		  }
		});
	}

	function exit() {
		console.log('Exit TEMP-meter');
		socketlist.forEach(function(socket) {
			console.log('Closing TEMP-meter socket');
		  socket.close();
		});
	}

	connectSocket();

	console.log('TEMP started');

	return {
		exit: exit
	}
}

module.exports = {
	create: function(Dashboard, app, io) {
		return new TemperatureMeter(Dashboard, app, io);
	}
};
