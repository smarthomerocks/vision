const winston = require('winston'),
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

module.exports = logger;

