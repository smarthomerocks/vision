const EventEmitter = require('events').EventEmitter,
      util = require('util'),
      _ = require('underscore'),
      request = require('request'),
      async = require('async'),
      colors = require('colors'), //eslint-disable-line no-unused-vars
      BlinkAPI = require('node-blink-security');

function Blink(Dashboard, app, io, config) {
  EventEmitter.call(this);

  if(config.username === null || config.username === '' || config.password === null || config.password === '') {
    console.log('Plugin ' + 'blink '.yellow.bold + 'Please check config. Could not found Blink username and/or password'.red);
    return;
  }

  var blink = new BlinkAPI(config.username, config.password);

  this.start = function() {

    var self = this;

    //var idx = _.map(_.filter(Dashboard.getConfig().modules, function(module) { return module.config.plugin === 'blink';}), function(module) { return module.config['id']; });

    if(blink._token) {
      console.log('Plugin ' + 'blink '.yellow.bold + 'Connection token exists.');
      self.emit('connect');
      return;
    }

    blink.setupSystem()
      .then(() => {
        self.emit('connect');
      }, (error) => {
        console.log('Plugin ' + 'blink '.yellow.bold + 'Error'.red, error);
      });
  };

  this.statusQueue = [];

  this.setArmStatus = function(name, armState = false) {
    console.log('Plugin ' + 'blink '.yellow.bold + 'setArmStatus'.blue + ' state: ' + armState);
    var camera = blink.cameras[name];
    if(camera) {
      self.emit('change', {state: 'busy'});
      camera.setArmed(armState)
        .then((res) => {
          self.emit('change', {state: 'idle'});
          self.getStatus(name);
        }, (error) => {
          console.log('Plugin ' + 'blink '.yellow.bold + ' setArmStatus '.blue + ' error'.red + name, error);
        });
    } else {
      console.log('Plugin ' + 'blink '.yellow.bold + ' setArmStatus '.blue + ' error'.red + name + ' camera not found.');
    }
  };

  this.getStatus = function(name) {

    var self = this;

    console.log('Plugin ' + 'blink '.yellow.bold + 'getStatus'.blue + ' ' + name);
    var camera = blink.cameras[name];

    if(camera && camera.thumbnail) {

      self.emit('change', {state: 'busy'});

      if(camera.thumbnaildata) {
        self.emit('change', {id: name, thumbnail: camera.thumbnaildata, lastUpdate: camera.updated_at});
      }

      var pending = _.find(self.statusQueue, function(n) { return n === camera.thumbnail; });

      if(pending) {
        // Call already pending
        return;
      }

      self.statusQueue.push(camera.thumbnail);

      camera.imageRefresh()
        .then((res) => {
          request({
            headers: camera._header,
            useragent: 'blink/1844 CFNetwork/808.3 Darwin/16.3.0',
            uri: camera.thumbnail,
            encoding: null,
            method: 'GET'
          }, function(err, response, body) {

            self.emit('change', {state: 'idle'});
            if(response.statusCode === 200) {
              camera.thumbnaildata = body.toString('base64');
              self.emit('change', {id: name, thumbnail: camera.thumbnaildata, lastUpdate: camera.updated_at, armed: camera.armed});
            } else {
              console.log('Plugin ' + 'blink '.yellow.bold + 'getStatus'.blue + 'camera ' + name.blue + ' error while fething thumbnail image'.red, err);
              self.emit('change', {id: name, lastUpdate: new Date()});
            }

            self.statusQueue = _.without(self.statusQueue, _.findWhere(self.statusQueue, name));
          });
        }, (error) => {
          console.log('Plugin ' + 'blink '.yellow.bold + ' getStatus '.blue + ' error'.red + name, error);
        });
    }
  };
  

  this.getSnapshot = function(name) {
    var self = this;
    console.log('Plugin ' + 'blink '.yellow.bold + ' getSnapshot '.blue + ' ' + name);

    var camera = blink.cameras[name];

    if(camera && camera.thumbnail && camera._header) {

      self.emit('change', {state: 'busy'});

      camera.snapPicture()
        .then((res) => {
          async.retry({times: 10, interval: 3000}, function(callback) {
            request({
              headers: camera._header,
              useragent: 'blink/1844 CFNetwork/808.3 Darwin/16.3.0',
              uri: config.host + '/network/'+ res.network_id +'/command/'+ res.id
            }, function(err, response, body) {
              if(response.statusCode === 200) {
                var objCommand = JSON.parse(response.body);
                var command = _.find(objCommand.commands, function(num) { return num.id === res.id;});
                var commandStatus = command.state_condition;
                if(commandStatus === 'done') {
                  callback();
                } else {
                  callback('Bad result...' + commandStatus);
                }
              }
            });
          }, function(err, result) {
            if(err) {
              console.log('Plugin ' + 'blink '.yellow.bold + ' getSnapshot '.blue + ' error '.red + name, err);
            }
            self.emit('change', {state: 'idle'});
            self.getStatus(name);
          });
          
        }, (error) => {
          self.emit('change', {state: 'idle'});
          console.log('Plugin ' + 'blink '.yellow.bold + ' getSnapshot '.blue + ' error '.red + name, error);
        });
    }
  };

  util.inherits(Blink, EventEmitter);
}
module.exports = {
  create: function(Dashboard, app, io, config) {
    return new Blink(Dashboard, app, io, config);
  }
};
