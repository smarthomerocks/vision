function MediaplayerFavorite(Dashboard, app, io) {
	var socketList = [];

	function connectSocket() {
		var nsp = io.of('/mediaplayer-favorite');

		nsp.on('connection', function(socket) {
			socketList.push(socket);

			console.log('Mediaplayer-favorite connected');

			var onevent = socket.onevent;
			socket.onevent = function (packet) {
			    var args = packet.data || [];
			    onevent.call(this, packet);    	// original call
			    packet.data = ["*"].concat(args);
			    onevent.call(this, packet);     // additional call to catch-all
			};

			socket.on('*', function(command, data) {
				onSocketUpdate(command, data);
			});

			socket.on('close', function () {
      	socketlist.splice(socketlist.indexOf(socket), 1);
    	});

			socket.emit('connected');

			function onSocketUpdate(command, data) {
				if (command === 'MEDIAPLAYER_FAVORITE_CONNECT') {
					connectPlugin(data.plugin);
				} else if (command === 'MEDIAPLAYER_FAVORITE_PLAY') {
		      Dashboard.mediaplayer.favorite(data.plugin, data.device, data.favoriteName);
				}
			}

		  function connectPlugin(plugin) {
		    Dashboard.mediaplayer.on(plugin, 'connect', function(data) {
					socket.emit('MEDIAPLAYER_FAVORITE_CONNECTED');
		    });

		    Dashboard.mediaplayer.start(plugin);
		  }

		});
	}

	function exit() {
		console.log('Exit sonos');
		socketlist.forEach(function(socket) {
			console.log('Closing mediaplayer socket');
		  socket.close();
		});
	}

	connectSocket();

	console.log('mediaplayer-favorite started');

	return {
		exit: exit
	}
}

module.exports = {
	create: function(Dashboard, app, io) {
		return new MediaplayerFavorite(Dashboard, app, io);
	}
};
