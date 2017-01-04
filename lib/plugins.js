var root = process.cwd(),
    path = require('path'),
  	fs = require('fs');

var pluginPath = path.join(root, 'plugins');

function getPlugins() {
	var plugins = [];

	var pluginFolders = fs.readdirSync(pluginPath);

	for (var i = 0, length = pluginFolders.length; i < length; i++) {
	  plugins.push(pluginFolders[i]);
	}

	return plugins;
}

function initPlugins(dashboard, app, io) {
	var plugins = getPlugins(),
			pluginList = {};

	for (var i = 0, length = plugins.length; i < length; i++) {
		var plugin = plugins[i];

		console.log('Loading plugin', plugin);

		pluginList[plugin] = require(path.join(pluginPath, plugin, plugin)).create(dashboard, app, io, dashboard.getConfig().plugins[plugin]);
	}

	return pluginList;
}

module.exports = {
	init: initPlugins
};
