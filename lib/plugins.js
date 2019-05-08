const path = require('path'),
      fs = require('fs'),
      colors = require('colors'), //eslint-disable-line no-unused-vars
      pluginPath = path.join(__dirname, '..', 'plugins');

function getPlugins() {
  let plugins = [];

  let pluginFolders = fs.readdirSync(pluginPath);

  for (let folder of pluginFolders) {
    if (folder.indexOf('.') !== 0) {
      plugins.push(folder);
    }
  }

  return plugins;
}

function initPlugins(dashboard, app, io) {
  let logger = require('../logger').logger,
      plugins = getPlugins(),
      pluginList = {};
  
  let definedPlugins = [...new Set(Object.keys(dashboard.getConfig().plugins).map((key) => { 
    return plugins.includes(key) ? key : null;
  }))];

  for (let plugin of definedPlugins) {
    if (plugin) {
      logger.info(`Loading plugin "${plugin}"`);
      pluginList[plugin] = require(path.join(pluginPath, plugin, plugin)).create(dashboard, app, io, dashboard.getConfig().plugins[plugin]);
    }
  }

  return pluginList;
}

module.exports = {
  init: initPlugins
};
