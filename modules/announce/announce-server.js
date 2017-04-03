var http = require('http');
var path = require('path');
var url = require('url');
var fs = require('fs');

function Announce(Dashboard, app, io) {
	var socketList = [];

	function connectSocket() {
		var nsp = io.of('/announce');

		nsp.on('connection', function(socket) {
			socketList.push(socket);

			console.log('Module ' + 'announce'.yellow.bold + ' connected');

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
				if (command === 'ANNOUNCE_CONNECT') {
					console.log('ANNOUNCE_CONNECT');
					socket.emit('ANNOUNCE_CONNECTED');
				} else if (command === 'ANNOUNCE_SEND') {
		      console.log('ANNOUNCE_SEND');

          var filename = 'dashboard-announce-' + new Date().getTime() + '.wav',
              filePath = path.resolve(data.path + path.sep + filename);

          fs.writeFile(filePath, data.audio, function(err) {
            if (err)
              return console.error(err);

              var callback = function(response) {

                response.on('data', function () {
                });

                response.on('end', function () {
                  fs.unlink(filePath, function(err) {
                    sendStatus(true);
                  });
                });
              }

              var request = http.request(url.parse(data.url + (data.room === 'all' ? '/clipall/' : '/' + data.room + '/clip/') + filename + '/' + data.volume), callback);

              request.on('error', function (e) {
                console.log('problem with request: ' + e.message);
              });

              request.end();
          });

				}
			}

		  function sendStatus(status) {
        socket.emit('ANNOUNCE_STATUS', { sent: status });
	    }
		});
	}

	function exit() {
		console.log('Exit announce');
		socketlist.forEach(function(socket) {
			console.log('Closing announce socket');
		  socket.close();
		});
	}

	connectSocket();

	console.log('Module ' + 'announce'.yellow.bold + ' started');

	return {
		exit: exit
	}
}

module.exports = {
	create: function(Dashboard, app, io) {
		return new Announce(Dashboard, app, io);
	}
};
