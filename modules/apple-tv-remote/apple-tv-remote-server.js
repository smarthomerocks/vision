function AppleTVRemote(Dashboard, app, io) {
	var socketList = [];

	function connectSocket() {
		var nsp = io.of('/apple-tv-remote');

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
				console.log('Apple-tv-remote', command, data);

				onSocketUpdate(command, data);
			});

			socket.on('close', function () {
      	socketlist.splice(socketlist.indexOf(socket), 1);
    	});

			socket.emit('connected');

			function onSocketUpdate(command, data) {
				if (command === 'APPLE_TV_REMOTE_CONNECT') {
					console.log('APPLE_TV_REMOTE_CONNECT');
					connectPlugin(data.plugin);
				} else if (command === 'APPLE_TV_REMOTE_SEND_COMMAND') {
		      console.log('APPLE_TV_REMOTE_SEND_COMMAND');
		      Dashboard.remotecontrol.sendCommand(data.plugin, data.commands);
				}
			}

		  function connectPlugin(plugin) {
		    Dashboard.remotecontrol.on(plugin, 'connect', function(data) {
					socket.emit('APPLE_TV_REMOTE_CONNECT');
		    });

		    Dashboard.remotecontrol.start(plugin);
		  }
		});
	}

	function exit() {
		console.log('Exit apple-tv-remote');
		socketlist.forEach(function(socket) {
			console.log('Closing apple-tv-remote socket');
		  socket.close();
		});
	}

	connectSocket();

	console.log('AppleTVRemote started');

	return {
		exit: exit
	}
}

module.exports = {
	create: function(Dashboard, app, io) {
		return new AppleTVRemote(Dashboard, app, io);
	}
};
