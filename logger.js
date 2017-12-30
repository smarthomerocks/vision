const fs = require('fs'),
      path = require('path'),
      morgan = require('morgan'),
      winston = require('winston'),
      winstonExpress = require('winston-express'),
      logger = new (winston.Logger)({
        level: process.env.LOGLEVEL ? process.env.LOGLEVEL : 'info',
        prettyPrint: true,
        exitOnError: false,
        handleExceptions: true,
        humanReadableUnhandledException: true,
        transports: [
          new (winston.transports.Console)({ 
            colorize: true,
            json: false            
          }),
          new (winston.transports.File)({
            filename: 'app.log',
            maxsize: 1048576 * 10,  // 10 Megabytes
            maxFiles: 10,
            json: false,
            colorize: false
          })
        ]
      });

function registerRequestLogger(app) {
    // log only 4xx and 5xx responses to console
  app.use(morgan('dev', {
    skip: function(req, res) { 
      return res.statusCode < 400;
    }
  }));

  // log all requests to access.log
  app.use(morgan('short', {
    stream: fs.createWriteStream(path.join(__dirname, 'access.log'), {
      flags: 'a'
    })
  }));
}

function registerClientLogger(app) {
  winstonExpress(app, logger);
}

module.exports = {
  logger: logger,
  registerRequestLogger: registerRequestLogger,
  registerClientLogger: registerClientLogger
};

