var NSRSocket = function(moduleName) {

	var self = this;

	if (typeof moduleName !== "string") {
		throw new Error("Please set the module name for the MMSocket.");
	}

	self.moduleName = moduleName;

	// Private Methods
	self.socket = io("/" + self.moduleName, {secure: config.ssl});
	var notificationCallback = function() {};

	var onevent = self.socket.onevent;
	self.socket.onevent = function(packet) {
		var args = packet.data || [];
		onevent.call(this, packet);    // original call
		packet.data = ["*"].concat(args);
		onevent.call(this, packet);      // additional call to catch-all
	};

	self.socket.on('error', function (err) {
    console.log("SOCKET ERROR", err);
		window.location.reload();
	});

	self.socket.on('connect_error', function(err){
    console.log('Connection Failed', err);
		window.location.reload();
	});

	// register catch all.
	self.socket.on("*", function(notification, payload) {
		if (notification !== "*") {
			notificationCallback(notification, payload);
		}
	});

	// Public Methods
	this.setNotificationCallback = function(callback) {
		notificationCallback = callback;
	};

	this.sendNotification = function(notification, payload) {
		if (typeof payload === "undefined") {
			payload = {};
		}
		self.socket.emit(notification, payload);
	};
};
