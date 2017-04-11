var path = require('path'),
		fs = require('fs'),
		_ = require('underscore'),
		colors = require('colors');

var modulePath = path.join(__dirname, '..', 'modules');

function getModules(config) {
	var modules = [];


	var moduleFolders = fs.readdirSync(modulePath);

	for (var i = 0, length = moduleFolders.length; i < length; i++) {
		if (moduleFolders[i].indexOf('.') !== 0) {
	  	modules.push(moduleFolders[i]);
		}
	}

	return modules;
}

function initModules(dashboard, app, io) {
	var modules = getModules(),
			moduleList = {};

  // Get unique modules from config and make there are on list before load
	var definedModules = _.chain(dashboard.getConfig().modules).map(function(module) { return _.contains(modules, module.module) ? module.module : null; }).uniq().value();

	for (var i = 0, length = definedModules.length; i < length; i++) {
		var module = definedModules[i],
				currentModulePath = path.join(modulePath, module, module + '-server.js');

		if (fs.existsSync(currentModulePath)) {
			console.log('Loading module', module.yellow.bold);

			var Module = require(currentModulePath),
					moduleInstance = new Module();

			moduleInstance.setName(module);
			moduleInstance.setExpressApp(app);
			moduleInstance.setSocketIO(io);
			moduleInstance.setDashboard(dashboard);

			moduleList[module] = moduleInstance;

			moduleInstance.loaded();
			moduleInstance.start();
		}
	}

	return moduleList;
}

module.exports = {
	init: initModules
};
