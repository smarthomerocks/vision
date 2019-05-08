const path = require('path'),
      fs = require('fs'),
      colors = require('colors'), //eslint-disable-line no-unused-vars
      modulePath = path.join(__dirname, '..', 'modules');

function getModulesDirectories(config) {
  let modules = [];

  let moduleFolders = fs.readdirSync(modulePath);

  for (let folder of moduleFolders) {
    if (folder.indexOf('.') !== 0) {
      modules.push(folder);
    }
  }

  return modules;
}

function initModules(dashboard, app, io) {
  let logger = require('../logger').logger,
      modulesDirectories = getModulesDirectories(),
      moduleList = {};

  // Get unique modules from config and make sure they are on list before load
  // Could be simpler once Node gets flatMap support, https://tc39.github.io/proposal-flatMap/
  let modules = Array.prototype.concat(...dashboard.getConfig().sections.map(s => s.modules));
  let definedModules = [...new Set(modules.map(module => { 
    return modulesDirectories.includes(module.module) ? module.module : null;
  }))];

  for (let module of definedModules) {
    if (module) {
      let currentModulePath = path.join(modulePath, module, module + '-server.js');

      if (fs.existsSync(currentModulePath)) {
        logger.debug('Loading module');

        let Module = require(currentModulePath),
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
  }

  return { 
    moduleServers: moduleList,
    modules: modules
  };
}

module.exports = {
  init: initModules
};
