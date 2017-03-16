var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('underscore');
var curl = require('curl');
var fs = require('fs');
var request = require('request');
var crypto = require('crypto');
var async = require('async');

function Blink(Dashboard, app, io, config) {
  EventEmitter.call(this);

  this.start = function() {

  var idx = _.map(_.filter(Dashboard.getConfig().modules, function(module){ return module.config.plugin == 'blink';}), function(module) { return module.config['id'] })
  
  var self = this;
   this.login(function(err){
      if(!err){
        self.emit('connect');
      }
   });
  };

  this.login = function(callback){
    var self = this;
    if(this.logintoken != null){
      callback(null);
    } else {
      console.log('Logging in BLINK...')
      var options = {
          url: config.host + '/api/v2/login',
          headers: { 'Host': 'rest.prde.immedia-semi.com', 'Content-Type': 'application/json', 'APP_BUILD': 'IOS_1844'},
          useragent: "blink/1844 CFNetwork/808.3 Darwin/16.3.0", 
          method: 'POST',
          data: {"password":config.password,"app_version":"2.9.19 (1844) #433f34e","os_version":"10.2.1","email":config.username,"client_type":"ios","device_identifier":"iPhone9,3"}
      };

      curl.postJSON(options.url, options.data, options,function(err, data){
        if(err){
          callback(err);
        }
        var obj = JSON.parse(data.body);
        if(obj.authtoken && obj.authtoken.authtoken){
          self.logintoken = obj.authtoken.authtoken;
          self.networks = obj.networks;
          callback(null);
        }
      });
    }
  };


this.getStatus = function(name) {
    var self = this;
    async.series([
    function(callback) { 
      self.login(function(err){
        callback(err);
      });
     },
    function(callback) { 
      // Get latest image thumbnail
      _.each(self.networks, function(a,b){
          var options = {
            url: config.host + '/network/' + b + '/homescreen',
            headers: { 'Host': 'rest.prde.immedia-semi.com', 'APP_BUILD': 'IOS_1844', 'TOKEN-AUTH': self.logintoken},
            useragent: "blink/1844 CFNetwork/808.3 Darwin/16.3.0", 
            method: 'GET',
          };

          curl.getJSON(options.url, options,function(err, data){
            if(err){
              callback(err);
            }
              var obj = JSON.parse(data.body);
              a.devices = obj.devices;

              async.each(obj.devices, function(device, callback) {
                if(device.device_type == "camera" && device.name == name){

                    var hash = crypto.createHash('md5').update(device.thumbnail).digest('hex');

                    var filename = 'images/camera_' + hash;

                    if(!fs.existsSync("public/" + filename +  ".jpg")){
                      request({
                        headers: { 'Host': 'rest.prde.immedia-semi.com', 'APP_BUILD': 'IOS_1844', 'TOKEN-AUTH': self.logintoken},
                        useragent: "blink/1844 CFNetwork/808.3 Darwin/16.3.0", 
                        uri: config.host + device.thumbnail + '.jpg',
                        encoding: 'binary',
                        method: 'GET'
                      }, function (err, response, body) {
                        
                        if(response.statusCode == 200){
                          fs.writeFile("public/" + filename +  ".jpg", body, 'binary', function(err) {
                              if(err)
                                callback(err);
                              else
                                console.log("The image file was saved!");
                                self.emit('change', {id: name, thumbnail:  '/' +filename +  ".jpg", lastUpdate: device.updated_at });
                                callback();
                          }); 
                        } else {
                          self.emit('change', {id: name, lastUpdate: data.updated_at});
                          callback();
                        }
                      });
                    } else {
                      self.emit('change', {id: name, thumbnail: '/' + filename + '.jpg', lastUpdate: device.updated_at });
                      callback();
                    }
                } else {
                  callback();
                }
              },function(err){
                callback(err);
              });
          });
        });
     }
    ], function(err, results) {
        
    });
  };

  this.getLiveview = function(name) {
    var self = this;
    console.log('--------- Blink getLiveliew ', name);

    _.each(self.networks, function(a,networkid){
      async.each(a.devices, function(device, callback) {
        if(device.name === name && device.device_type == "camera" ){
          request({
              headers: { 'Host': 'rest.prde.immedia-semi.com', 'APP_BUILD': 'IOS_1844', 'TOKEN-AUTH': self.logintoken, 'Content-Length': '0'},
              useragent: "blink/1844 CFNetwork/808.3 Darwin/16.3.0", 
              uri: config.host + '/network/'+ networkid +'/camera/'+ device.device_id +'/liveview',
              method: 'POST'
            }, function (err, response, body) {
              
              if(err || response.statusCode == ! 200){
                console.log("Error", err);
                callback(err, tries);
              } else {
                 var obj = JSON.parse(response.body);
                  var commandid = obj.id;
                  console.log('Got response ', obj);

                  if(obj.message){
                    callback(obj.code, tries);
                  }

                var tries = 0;
                async.whilst(
                    function() { return tries < 5; },
                    function(callback) {
                        tries++;
                        request({
                          headers: { 'Host': 'rest.prde.immedia-semi.com', 'APP_BUILD': 'IOS_1844', 'TOKEN-AUTH': self.logintoken},
                          useragent: "blink/1844 CFNetwork/808.3 Darwin/16.3.0", 
                          uri: config.host + '/network/'+ networkid +'/command/'+ commandid,
                          method: 'GET'
                        }, function (err, response, body) {


                          if(response.statusCode ==  200){

                            var objCommand = JSON.parse(response.body);
                            var command = _.find(objCommand.commands, function(num){ return num.id == commandid});
                            var commandStatus = command.state_condition;
                            var commandStage = command.state_stage;
                            var stageLive= command.stage_live;
                            var liveUrl = command.server;

                            if(commandStatus == 'running' && commandStage == 'dev'){
                        
                                  var hash = crypto.createHash('md5').update(command.updated_at).digest('hex');

                                  var filename = 'images/camera_' + hash + '.mp4';

                                  var ffmpegBin = require('ffmpeg-static'),
                                      progressStream = require('ffmpeg-progress-stream'),
                                      spawn = require('child_process').spawn;

                                  var params = [
                                    '-i', liveUrl.replace('rtsps','rtsp'),
                                    '-vf', 'scale=320:240',
                                    '-vf', 'fps=200',
                                    '-crf', '120',
                                    'public/' + filename
                                  ]

                                  params = [
                                    '-i', liveUrl.replace('rtsps','rtsp'),
                                    '-f', 'mp4',
                                    '-b', '500k',
                                    'public/' + filename
                                  ]

                                  var ffmpeg = spawn(ffmpegBin.path, params);
                                  var pipestream = function(data){
                                  }
                                  ffmpeg.stderr
                                    .pipe(progressStream(120))
                                    .on('data', pipestream)
                                    .on('exit', function(){
                                      console.log('FFMPEG KLAR...')
                                    })
                                    .on('error', function(err){
                                      console.log("Got stream error", err)
                                    });
                                    setTimeout(function() {
     
                                      request({
                                        headers: { 'Host': 'rest.prde.immedia-semi.com', 'APP_BUILD': 'IOS_1844', 'TOKEN-AUTH': self.logintoken, 'Content-Length': '0'},
                                        useragent: "blink/1844 CFNetwork/808.3 Darwin/16.3.0", 
                                        uri: config.host + '/network/'+ networkid +'/command/'+ commandid + '/done',
                                        method: 'POST'
                                      }, function (err, response, body) {
                                      });
                                        console.log('-----------------------DONE ' + response);

                                        ffmpeg.kill();

                                        setTimeout(function() {
                                          self.emit('change', {id: name, liveview: filename, lastUpdate: new Date()});
                                        }, 1000);


                                        callback(null, 5);
                                    }, 17000);
                                  

                            } else {
                              setTimeout(function() {
                                  callback(null, tries);
                              }, 1000);
                            }
                          }
                          
                          
                        });
                    },
                    function (err, n) {
                      callback();
                    }
                );
              
              }
            });
        }else{
          callback();
        }
      }, function(err){
        console.log('getSnapshot', err);        
        if(!err){
          //self.getStatus(name);
        }
      });
    });
  };

  this.getSnapshot = function(name) {
    var self = this;
    console.log('--------- Blink getSnapshot ', name);

    _.each(self.networks, function(a,networkid){
      async.each(a.devices, function(device, callback) {
        
        if(device.name === name && device.device_type == "camera" ){
          request({
              headers: { 'Host': 'rest.prde.immedia-semi.com', 'APP_BUILD': 'IOS_1844', 'TOKEN-AUTH': self.logintoken},
              useragent: "blink/1844 CFNetwork/808.3 Darwin/16.3.0", 
              uri: config.host + '/network/'+ networkid +'/camera/'+ device.device_id +'/thumbnail',
              method: 'POST'
            }, function (err, response, body) {
              
              if(err || response.statusCode == ! 200){
                callback(err);
              } else {
                 var obj = JSON.parse(response.body);
                var commandid = obj.id;

                var tries = 0;
                async.whilst(
                    function() { return tries < 5; },
                    function(callback) {
                        tries++;
                        request({
                          headers: { 'Host': 'rest.prde.immedia-semi.com', 'APP_BUILD': 'IOS_1844', 'TOKEN-AUTH': self.logintoken},
                          useragent: "blink/1844 CFNetwork/808.3 Darwin/16.3.0", 
                          uri: config.host + '/network/'+ networkid +'/command/'+ commandid,
                          method: 'GET'
                        }, function (err, response, body) {
                          if(response.statusCode ==  200){

                            var objCommand = JSON.parse(response.body);
                            var command = _.find(objCommand.commands, function(num){ return num.id == commandid});
                            var commandStatus = command.state_condition;
                            if(commandStatus == 'done'){
                              tries = 5;
                                  callback(null, tries);

                            } else {
                              setTimeout(function() {
                                  callback(null, tries);
                              }, 2000);
                            }
                          }
                          
                          
                        });
                    },
                    function (err, n) {
                      callback();
                    }
                );
              
              }
            });
        }else{
          callback();
        }
      }, function(err){
        console.log('getSnapshot', err);        
        if(!err){
          self.getStatus(name);
        }
      });
    });
  };

util.inherits(Blink, EventEmitter);
};
module.exports = {
	create: function(Dashboard, app, io, config) {
		return new Blink(Dashboard, app, io, config);
	}
};
