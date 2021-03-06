const EventEmitter = require('events').EventEmitter,
      util = require('util'),
      async = require('async'),
      verisure = require('verisure'),
      logger = require('../../logger').logger;


function Verisure(Dashboard, app, io, config) {
  EventEmitter.call(this);
  
  let self = this,
      doorLockSubscibersList = [],
      alarmSubscibersList = [],
      lastOverViewResponses = {},
      authCallInProgress = false,
      overviewPollTimer = null;

  this.username = config.username;
  this.password = config.password;

  this.start = function() {
    logger.info('Plugin ' + 'verisure'.yellow.bold + ' start. ');

    if (self.token) {
      self.emit('connect');
    } else {

      if (!authCallInProgress) {
        authCallInProgress = true;
        verisure.auth(config.username, config.password, function(err, token) {
          if (err) {
            logger.error('Plugin ' + 'verisure'.yellow.bold + ' auth error. ', err);
          }
          self.token = token;
          self.authCallInProgress = false;
          self.emit('connect');
        });
      }
    }
  };

  this.getLastestOverView = function(callback) {

    if (!self.token) {
      callback('No token exists');
    } else {
      if (self.overViewCallInProgress) {
        callback('Call in progress');
      } else {
        self.overViewCallInProgress = true;
  
        verisure.installations(self.token, config.username, function(err, installations) {
          
          if (err) {
            logger.debug('Plugin ' + 'verisure '.yellow.bold + ' getLastestOverView '.blue + ' error'.red, err);
            callback(err);
          } else {
            if (!installations) {
              logger.warn('Plugin ' + 'verisure '.yellow.bold + 'No installations found'.red);
              callback(err);
            } else {
              // Find installation by alias

              async.each(installations, function(installation, callbackEach) {
                
                verisure.overview(self.token, installation, function(err, overview) {
                  lastOverViewResponses[installation.alias] = overview;
                  callbackEach();
                });

              }, function(err) {
                self.overViewCallInProgress = false;
                self.parseAndSendStatusUpdate();
                self.reloadTimer();
                callback(null, lastOverViewResponses);
              });
            }
          }
  
        });
      }

    }

  };

  this.reloadTimer = function() {
    clearTimeout(overviewPollTimer);
    overviewPollTimer = setTimeout(function() {
      self.getLastestOverView(function(err, ok) {
        if (err) {
          logger.error('ERR', err);
        }
        self.reloadTimer();
      });
    }, 60000);
  };

  this.parseAndSendStatusUpdate = function() {
    logger.debug('Plugin ' + 'verisure'.yellow.bold + ' parseAndSendStatusUpdate. ');

    // Doorlocks
    for (let subscriber of doorLockSubscibersList) {
      if (lastOverViewResponses[subscriber.alias]) {
        for (let doorlock of lastOverViewResponses[subscriber.alias].doorLockStatusList) {
          if (subscriber.area == doorlock.area) {
            self.emit('doorlock_change', {area: doorlock.area, alias: subscriber.alias, lockstate: doorlock.currentLockState === 'LOCKED', lockdate: doorlock.eventTime, user: doorlock.userString, method: doorlock.method});
          }
        }
      }
    }

    // Alarm state
    for (let subscriber of alarmSubscibersList) {
      if (lastOverViewResponses[subscriber.alias]) {
        /*
        armState.statusType:
        'ARMED'
        'ARMED_HOME'
        'DISARMED'
        */
        self.emit('security_alarm_change', {alias: subscriber.alias, alarm_state: lastOverViewResponses[subscriber.alias].armState.statusType, armdate: lastOverViewResponses[subscriber.alias].armState.date});
      }
    }
  };

  this.getAlarmStatus = function(alias) {
    logger.debug('Plugin ' + 'verisure'.yellow.bold + ' getAlarmStatus. ' + alias);

    // Do we have this doorlock in event list?
    let eventSubscriberExists = alarmSubscibersList.find(item => {
      return item.alias === alias;
    });

    // Add to subsciber list
    if (!eventSubscriberExists) {
      alarmSubscibersList.push({alias: alias});
    }

    if (lastOverViewResponses[alias]) {
      // Use existing data
      self.parseAndSendStatusUpdate();
    } else {
      // Request new data
      self.getLastestOverView(function(err, ok) {});
    }
  };

  this.getDoorLockStatus = function(alias, area) {
    logger.debug('Plugin ' + 'verisure'.yellow.bold + ' getDoorLockStatus. ' + alias + ' ' + area);

    // Do we have this doorlock in event list?
    let eventSubscriberExists = doorLockSubscibersList.find(item => { 
      return item.alias === alias && item.area == area;
    });

    // Add to subsciber list
    if (!eventSubscriberExists) {
      doorLockSubscibersList.push({alias: alias, area: area});
    }

    if (lastOverViewResponses[alias]) {
      // Use existing data
      self.parseAndSendStatusUpdate();
    } else {
      // Request new data
      self.getLastestOverView(function(err, ok) {});
    }
  };
}

util.inherits(Verisure, EventEmitter);

module.exports = {
  create: function(Dashboard, app, io, config) {
    return new Verisure(Dashboard, app, io, config);
  }
};
