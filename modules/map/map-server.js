function Map(Dashboard, app, io) {
	var socketList = [];

	function connectSocket() {
		var nsp = io.of('/map');

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
				console.log('Map', command, data);

				onSocketUpdate(command, data);
			});

			socket.on('close', function () {
      	socketlist.splice(socketlist.indexOf(socket), 1);
    	});

			socket.emit('connected');

			function onSocketUpdate(command, data) {
				if (command === 'MAP_CONNECT') {
					console.log('MAP_CONNECT');
					connectPlugin(data.plugin);
				}
			}

		  function connectPlugin(plugin) {
		    Dashboard.location.on(plugin, 'connect', function(data) {
					socket.emit('MAP_CONNECTED');
		    });

		    Dashboard.location.on(plugin, 'change', function(data) {
		      socket.emit('MAP_STATUS', data);
		    });

		    Dashboard.location.start(plugin);
		  }
		});
	}

	function exit() {
		console.log('Exit map');
		socketlist.forEach(function(socket) {
			console.log('Closing map socket');
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
		return new Map(Dashboard, app, io);
	}
};
