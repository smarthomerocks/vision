const express = require('express'),
      fs = require('fs'),
      path = require('path'),     
      cookieParser = require('cookie-parser'),
      bodyParser = require('body-parser'),
      constants = require('constants'),
      logger = require('./logger'),
      routes = require('./routes/index'),
      plugins = require('./lib/plugins'),
      modules = require('./lib/modules'),
      Dashboard = require('./lib/dashboard');

var dashboard = new Dashboard();

dashboard.setConfig(dashboard.loadConfig());
/*
function approveDomains(opts, certs, cb) {
  // This is where you check your database and associated
  // email addresses with domains and agreements and such


  // The domains being approved for the first time are listed in opts.domains
  // Certs being renewed are listed in certs.altnames
  if (certs) {
    opts.domains = certs.altnames;
  } else {
    opts.email = 'john.doe@example.com';
    opts.agreeTos = true;
  }

  // NOTE: you can also change other options such as `challengeType` and `challenge`
  // opts.challengeType = 'http-01';
  // opts.challenge = require('le-challenge-fs').create({});

  cb(null, {options: opts, certs: certs});
}

var lex = require('greenlock-express').create({
  // set to https://acme-v01.api.letsencrypt.org/directory in production
  server: 'staging',
  challenges: {
    'http-01': require('le-challenge-fs').create({
      webrootPath: '/tmp/acme-challenges'
    })
  },
  store: require('le-store-certbot').create({
    webrootPath: '/tmp/acme-challenges'
  }),
  approveDomains: approveDomains
});

// handles acme-challenge and redirects to https
require('http').createServer(lex.middleware(require('redirect-https')())).listen(80, function() {
  logger.debug("Listening for ACME http-01 challenges on", this.address());
});

var app = require('express')();
app.use('/', function(req, res) {
  res.end('Hello, World!');
});

// handles your app
var server = require('https').createServer(lex.httpsOptions, lex.middleware(app)).listen(443, function() {
  logger.debug("Listening for ACME tls-sni-01 challenges and serve app on", this.address());
});
*/

var app = express();
var server = require('http').Server(app);

// TODO: Add support for https://letsencrypt.org/
var secureServer = require('https').createServer({
  key: fs.readFileSync(__dirname + '/server.key'),
  cert: fs.readFileSync(__dirname + '/server.pem'),
  secureProtocol: 'SSLv23_method',
  secureOptions: constants.SSL_OP_NO_SSLv3 | constants.SSL_OP_NO_SSLv2
}, app);

var io = require('socket.io')(dashboard.getConfig().ssl ? secureServer : server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(function(req, res, next) {
  res.io = io;
  next();
});

// capture clientside log messages
logger.registerClientLogger(app);
// log requests to accesslog
logger.registerRequestLogger(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/modules', require('less-middleware')(path.join(__dirname, 'modules')));
app.use('/modules', express.static(path.join(__dirname, 'modules')));
app.use('/config', express.static(path.join(__dirname, 'config')));

dashboard.setPlugins(plugins.init(dashboard, app, io));
dashboard.setModules(modules.init(dashboard, app, io));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

process.on('SIGINT', function() {
  dashboard.exit();

  setTimeout(function() {
    process.exit();
  }, 1000);
});

module.exports = {app: app, server: server, secureServer: secureServer};
