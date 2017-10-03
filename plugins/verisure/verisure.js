const EventEmitter = require('events').EventEmitter,
  util = require('util'),
  _ = require('underscore'),
  verisure = require('verisure');


function Verisure(Dashboard, app, io, config) {
  EventEmitter.call(this);
  
    let self = this;

    this.username = config.username;
    this.password = config.password;
    this.token = "";
  
    this.start = function() {
      console.log('Plugin ' + 'verisure'.yellow.bold + ' start. ');
  
      verisure.auth(config.username, config.password, function(err, token) {
        self.token = token;
        self.emit('connect');
      })
    }

    this.getDoorLockStatus = function(alias, area){
      console.log('Plugin ' + 'verisure'.yellow.bold + ' getDoorLockStatus. ' + alias + " " + area);
      verisure.installations(this.token, config.username, function(err, installations) {
        
        if(!installations){
          console.log('Plugin ' + 'verisure '.yellow.bold + 'No installations found'.red);
        } else {
          // Find installation by alias
          var installation = _.find(installations, function(n){return n.alias == alias });
          
          if(installation){
            console.log('Plugin ' + 'verisure '.yellow.bold + 'Found installation ' +  alias.green);

            verisure.overview(self.token, installation, function(err, overview) {
              var doorlock = _.find(overview.doorLockStatusList, function(n){return n.area == area });
              if(doorlock){
                console.log('Plugin ' + 'verisure '.yellow.bold + 'Found doorlock ' +  area);
                /*
                Example data: 
                { 
                  deviceLabel: 'XXXX XXXX',
                  userString: 'Firstname Lastname',
                  method: 'CODE',
                  area: 'Tvättstuga',
                  method: 'AUTO',
                  lockedState: 'LOCKED',
                  currentLockState: 'LOCKED',
                  pendingLockState: 'NONE',
                  eventTime: '2017-10-03T06:50:36.000Z',
                  secureModeActive: false,
                  motorJam: false,
                  paired: true 
                }
                */
                self.emit('doorlock_change', {area: area, alias: alias, lockstate: doorlock.currentLockState === 'LOCKED', lockdate: doorlock.eventTime, user: doorlock.userString, method: doorlock.method});
              }
            });
          }
        }
      });
    };
}

util.inherits(Verisure, EventEmitter);

module.exports = {
	create: function(Dashboard, app, io, config) {
		return new Verisure(Dashboard, app, io, config);
	}
};
