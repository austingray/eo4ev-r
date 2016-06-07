var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var passportSocketIo = require("passport.socketio");

var favicon = require('serve-favicon');
var logger = require('morgan');
var flash = require('connect-flash');
var fs = require('fs');
var util = require('util');
var bcrypt = require('bcrypt');
var moment = require('moment');
var pug = require('pug');
var KnexSessionStore = require('connect-session-knex')(session);

var dbConfig = {
    client: 'postgresql',
    connection: {
      database: 'eo_db',
      user:     'eo_us',
      password: 'eo_pw'
    },
    pool: {
      min: 2,
      max: 10
    },
}
var Knex = require('knex');
var knex = Knex(dbConfig);
var store = new KnexSessionStore({
    knex: knex,
    tablename: 'sessions' // optional. Defaults to 'sessions'
});

//db
process.env.PG_CONNECTION_STRING = "postgres://eo_us:eo_pw@localhost/eo_db";
var Users = require('./db/users.js');

//routes
var routes = require('./routes/index');

//environemt variables
process.env.TZ = 'UTC';
if (app.get('env') === 'development') {
  process.env.PG_CONNECTION_STRING = "";
}

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));
//app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'to be or not to be!? das de mudda fuckin question!!!',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 1000 // milliseconds
    },
    store: store
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use('/', routes);

//.set
app.disable('x-powered-by');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//passport
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  new Users({ id: id })
    .fetch()
    .then(function(model){
      done(null, model.toJSON());    
    });
});
//local strategy
passport.use(new LocalStrategy(
  function(username, password, done) {
    new Users({ username: username }).fetch().then(function(model) {
      if (model === null) return done(null, false, { message: 'Incorrect username.' });
      bcrypt.compare(password, model.attributes.hash, function(err, res) {
        if (err) return done(err);
        return done(null, model.toJSON());
      });
    });
  }
));

var io_session = passportSocketIo.authorize({
  cookieParser: cookieParser,       // the same middleware you registrer in express
  key:          'connect.sid',       // the name of the cookie where express/connect stores its session_id
  secret:       'to be or not to be!? das de mudda fuckin question!!!',    // the session_secret to parse the cookie
  store:        store,        // we NEED to use a sessionstore. no memorystore please
  success:      onAuthorizeSuccess,  // *optional* callback on success - read more below
  fail:         onAuthorizeFail,     // *optional* callback on fail/error - read more below
});

//start er up
var debug = require('debug')('express-generator:server');
var port = process.env.PORT || '8081';
app.set('port', port);


function onAuthorizeSuccess(data, accept){
  console.log('successful connection to socket.io');

  // The accept-callback still allows us to decide whether to
  // accept the connection or not.
  //accept(null, true);

  // OR

  // If you use socket.io@1.X the callback looks different
  accept();
}

function onAuthorizeFail(data, message, error, accept){
  if(error)
    throw new Error(message);
  console.log('failed connection to socket.io:', message);

  // We use this callback to log all of our failed connections.
  accept(null, false);

  // OR

  // If you use socket.io@1.X the callback looks different
  // If you don't want to accept the connection
  if(error)
    accept(new Error(message));
  // this error will be sent to the user as a special error-package
  // see: http://socket.io/docs/client-api/#socket > error-object
}
//game engine
var game_server = require('./game/server')({io: io, io_session: io_session});

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

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

module.exports = app;