var path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    colors = require('colors'), //eslint-disable-line no-unused-vars
    pluginPath = path.join(__dirname, '..', 'plugins');

function getPlugins() {
  var plugins = [];

  var pluginFolders = fs.readdirSync(pluginPath);

  for (var i = 0, length = pluginFolders.length; i < length; i++) {
    if (pluginFolders[i].indexOf('.') !== 0) {
      plugins.push(pluginFolders[i]);
    }
  }

  return plugins;
}

function initPlugins(dashboard, app, io) {
  var logger = require('../logger'),
      plugins = getPlugins(),
      pluginList = {};

  var definedPlugins = _.uniq(_.map(dashboard.getConfig().plugins, function(num, key) { return _.contains(plugins, key) ? key : null; }));
  for (var i = 0, length = definedPlugins.length; i < length; i++) {
    var plugin = definedPlugins[i];

    logger.info(`Loading plugin "${plugin}"`);

    pluginList[plugin] = require(path.join(pluginPath, plugin, plugin)).create(dashboard, app, io, dashboard.getConfig().plugins[plugin]);
  }

  return pluginList;
}

module.exports = {
  init: initPlugins
};
