var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('underscore');
var curl = require('curl');
var fs = require('fs');
var request = require('request');
var crypto = require('crypto');
var async = require('async');
var colors = require('colors');
const BlinkAPI = require('node-blink-security');

function Blink(Dashboard, app, io, config) {
  EventEmitter.call(this);

  if(config.username ==  null || config.username == "" || config.password ==  null || config.password == "" ){
    console.log('Plugin ' + 'blink '.yellow.bold + 'Please check config. Could not found Blink username and/or password'.red);
    return;
  }

  var blink = new BlinkAPI(config.username, config.password);

  this.start = function() {

    var self = this;

    var idx = _.map(_.filter(Dashboard.getConfig().modules, function(module){ return module.config.plugin == 'blink';}), function(module) { return module.config['id'] })

    if(blink._token){
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

this.getStatus = function(name) {

    var self = this;

    console.log('Plugin ' + 'blink '.yellow.bold + 'getStatus'.blue + ' ' + name);
    var camera = blink.cameras[name];

    if(camera && camera.thumbnail){

      if(camera.thumbnaildata) {
        self.emit('change', {id: name, thumbnail: camera.thumbnaildata, lastUpdate: camera.updated_at});
      }

      var pending = _.find(self.statusQueue, function(n){ return n == camera.thumbnail; });

      if(pending){
        // Call already pending
        return;
      }

      self.statusQueue.push(camera.thumbnail);

      camera.imageRefresh()
        .then((res) => {
          request({
            headers: camera._header,
            useragent: "blink/1844 CFNetwork/808.3 Darwin/16.3.0", 
            uri: camera.thumbnail,
            encoding: null,
            method: 'GET'
          }, function (err, response, body) {
            if(response.statusCode == 200){
              camera.thumbnaildata = body.toString('base64');
              self.emit('change', {id: name, thumbnail: camera.thumbnaildata, lastUpdate: camera.updated_at});
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

    if(camera && camera.thumbnail && camera._header){

      camera.snapPicture()
        .then((res) => {
          async.retry({times: 5, interval: 2000}, function(callback){
            request({
                headers: camera._header,
                useragent: "blink/1844 CFNetwork/808.3 Darwin/16.3.0", 
                uri: config.host + '/network/'+ res.network_id +'/command/'+ res.id,
              }, function (err, response, body) {
                if(response.statusCode ==  200){
                    var objCommand = JSON.parse(response.body);
                    var command = _.find(objCommand.commands, function(num){ return num.id == res.id});
                    var commandStatus = command.state_condition;
                    if(commandStatus == 'done'){
                      callback();
                    } else {
                      callback("Bad result..." + commandStatus);
                    }
                  }
              });
          }, function(err, result) {
	          if(err) {
              console.log('Plugin ' + 'blink '.yellow.bold + ' getSnapshot '.blue + ' error'.red + name, err);
            } 
            self.getStatus(name);
          });
          
        }, (error) => {
          console.log('Plugin ' + 'blink '.yellow.bold + ' getSnapshot '.blue + ' error'.red + name, error);
      });
    }
  };

util.inherits(Blink, EventEmitter);
};
module.exports = {
	create: function(Dashboard, app, io, config) {
		return new Blink(Dashboard, app, io, config);
	}
};
