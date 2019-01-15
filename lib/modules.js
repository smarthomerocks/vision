var path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    colors = require('colors'), //eslint-disable-line no-unused-vars
    modulePath = path.join(__dirname, '..', 'modules');

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
  var logger = require('../logger').logger,
      modules = getModules(),
      moduleList = {};

  // Get unique modules from config and make sure they are on list before load
  // Could be simpler once Node gets flatMap support, https://tc39.github.io/proposal-flatMap/
  var definedModules = _.chain(Array.prototype.concat(...dashboard.getConfig().sections.map(s => s.modules))).map(function(module) { return _.contains(modules, module.module) ? module.module : null; }).uniq().value();

  for (var i = 0, length = definedModules.length; i < length; i++) {
    var module = definedModules[i],
        currentModulePath = path.join(modulePath, module, module + '-server.js');

    if (fs.existsSync(currentModulePath)) {
      logger.debug('Loading module');

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
