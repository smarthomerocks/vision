/* global Log, Class, Loader, Class , MM */
/* exported Module */

/* Magic Mirror
 * Module Blueprint.
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

var Module = Class.extend({

	/*********************************************************
	 * All methods (and properties) below can be subclassed. *
	 *********************************************************/

	// Module config defaults.
	defaults: {},

	/* init()
	 * Is called when the module is instantiated.
	 */
	init: function () {
		//console.log(this.defaults);
	},

	/* start()
	 * Is called when the module is started.
	 */
	start: function () {
		console.info("Starting module: " + this.name);
	},

	/* getScripts()
	 * Returns a list of scripts the module requires to be loaded.
	 *
	 * return Array<String> - An array with filenames.
	 */
	getScripts: function () {
		return [];
	},

	/* getStyles()
	 * Returns a list of stylesheets the module requires to be loaded.
	 *
	 * return Array<String> - An array with filenames.
	 */
	getStyles: function () {
		return [];
	},

	/* getDom()
	 * This method generates the dom which needs to be displayed. This method is called by the Magic Mirror core.
	 * This method needs to be subclassed if the module wants to display info on the mirror.
	 *
	 * return domobject - The dom to display.
	 */
	getDom: function () {
		var nameWrapper = document.createElement("div");
		var name = document.createTextNode(this.name);
		nameWrapper.appendChild(name);

		var identifierWrapper = document.createElement("div");
		var identifier = document.createTextNode(this.identifier);
		identifierWrapper.appendChild(identifier);
		identifierWrapper.className = "box";

		var div = document.createElement("div");
		div.appendChild(nameWrapper);
		div.appendChild(identifierWrapper);

		return div;
	},

	/* socketNotificationReceived(notification, payload)
	 * This method is called when a socket notification arrives.
	 *
	 * argument notification string - The identifier of the notification.
	 * argument payload mixed - The payload of the notification.
	 */
	socketNotificationReceived: function (notification, payload) {
		console.log(this.name + " received a socket notification: " + notification + " - Payload: " + payload);
	},

	/*********************************************
	 * The methods below don"t need subclassing. *
	 *********************************************/

	/* setData(data)
	 * Set the module data.
	 *
	 * argument data obejct - Module data.
	 */
	setData: function (data) {
		this.data = data;
		this.name = data.name;
		this.identifier = data.identifier;
		this.hidden = false;

		this.setConfig(data.config);
	},

	/* setConfig(config)
	 * Set the module config and combine it with the module defaults.
	 *
	 * argument config obejct - Module config.
	 */
	setConfig: function (config) {
		this.config = Object.assign({}, this.defaults, config);
	},

	/* socket()
	 * Returns a socket object. If it doesn"t exist, it"s created.
	 * It also registers the notification callback.
	 */
	socket: function () {
		if (typeof this._socket === "undefined") {
			this._socket = this._socket = new NSRSocket(this.name);
		}

		var self = this;
		this._socket.setNotificationCallback(function (notification, payload) {
			self.socketNotificationReceived(notification, payload);
		});

		return this._socket;
	},

	/* file(file)
	 * Retrieve the path to a module file.
	 *
	 * argument file string - Filename.
	 *
	 * return string - File path.
	 */
	file: function (file) {
		return this.data.path + "/" + file;
	},

	/* loadStyles()
	 * Load all required stylesheets by requesting the MM object to load the files.
	 *
	 * argument callback function - Function called when done.
	 */
	loadStyles: function (callback) {
		var self = this;
		var styles = this.getStyles();

		var loadNextStyle = function () {
			if (styles.length > 0) {
				var nextStyle = styles[0];
				Loader.loadFile(nextStyle, self, function () {
					styles = styles.slice(1);
					loadNextStyle();
				});
			} else {
				callback();
			}
		};

		loadNextStyle();
	},

	/* loadScripts()
	 * Load all required scripts by requesting the MM object to load the files.
	 *
	 * argument callback function - Function called when done.
	 */
	loadScripts: function (callback) {
		var self = this;
		var scripts = this.getScripts();

		var loadNextScript = function () {
			if (scripts.length > 0) {
				var nextScript = scripts[0];
				Loader.loadFile(nextScript, self, function () {
					scripts = scripts.slice(1);
					loadNextScript();
				});
			} else {
				callback();
			}
		};

		loadNextScript();
	},

	/* sendSocketNotification(notification, payload)
	 * Send a socket notification to the node helper.
	 *
	 * argument notification string - The identifier of the notification.
	 * argument payload mixed - The payload of the notification.
	 */
	sendSocketNotification: function (notification, payload) {
		this.socket().sendNotification(notification, payload);
	},

	isTouchSupported: function() {
		return NSR.isTouchSupported;
	},

	clickEvent: function() {
		return NSR.clickEvent;
	},
});

Module.definitions = {};

Module.create = function (name) {

	// Make sure module definition is available.
	if (!Module.definitions[name]) {
		return;
	}

	var moduleDefinition = Module.definitions[name];
	var clonedDefinition = cloneObject(moduleDefinition);

	// Note that we clone the definition. Otherwise the objects are shared, which gives problems.
	var ModuleClass = Module.extend(clonedDefinition);

	return new ModuleClass();

};

Module.register = function (name, moduleDefinition) {
	console.log("Module registered: " + name);
	Module.definitions[name] = moduleDefinition;
};
