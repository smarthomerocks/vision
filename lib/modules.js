var root = process.cwd(),
		path = require('path'),
		fs = require('fs');

var modulePath = path.join(root, 'modules');

function getModules() {
	var modules = [];

	var moduleFolders = fs.readdirSync(modulePath);

	for (var i = 0, length = moduleFolders.length; i < length; i++) {
	  modules.push(moduleFolders[i]);
	}

	return modules;
}

function initModules(Dashboard, app, io) {
	var modules = getModules(),
			moduleList = {};

	for (var i = 0, length = modules.length; i < length; i++) {
		var module = modules[i];

		console.log('Loading module', module);

		moduleList[module] = require(path.join(modulePath, module, module + '-server.js')).create(Dashboard, app, io);
	}

	return moduleList;
}

module.exports = {
	init: initModules
};
