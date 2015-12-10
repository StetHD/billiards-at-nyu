var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Non-default requires
var http = require('http');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var db = require('./db.js'); //dbs file
var session = require('express-session');
var crypto = require('crypto');

var routes = require('./routes/index');
var users = require('./routes/users');
var posts = require('./routes/posts');
var tournaments = require('./routes/tournaments');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Non-default middleware
var sessionOptions = {
  secret: "NATSUME RIN",
  resave: true,
  saveUninitialized: true
};
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());

// neo4j config
// Check postcount node is initialized
db.cypher({
  query: "MATCH (n:PostCount) RETURN n"
}, function(err, results) {
  if (!results[0]) {
    db.cypher({
      query: "CREATE (n:PostCount {count: 0})"
    }, function(err, results) {
      console.log("PostCount node created");
    });
  }
});

// Passport config
passport.use(new LocalStrategy(
  function(usernamein, password, done) {
    db.cypher({
      query: 'MATCH (user:User {username: {username}}) RETURN user',
      params: {
          username: usernamein
      }
    }, function(err, results) {
      if (err) {
        return done(err);
      }
      if (!results[0]) {
        console.log("bad username");
        return done(null,false, {message: "Incorrect Username/Password"});
      }
      var user = results[0].user;
      if (!validatePassword(user, password)) {
        console.log("bad password");
        return done(null, false, {message: "Incorrect Username/Password"});
      }
      
      console.log("login successful");
      return done(null, user);
    });
  }
));
passport.serializeUser(function(user, done) {
  console.log("serializing user");
  done(null,  user.properties.username);
});
passport.deserializeUser(function(id, done) {
  console.log("deserializing user");
  console.log("ID IS " + id);
  console.log(typeof id);
  db.cypher({
    query: "MATCH (n:User {username:{Username}}) RETURN n",
    params: {
      Username: id
    }
  }, function(err, results) {
    //var foundUser = results[0].n;
    if (results[0].n.labels.indexOf("Admin") != -1) {
      results[0].n.isAdmin = true;
    }
    done(err, results[0].n);
  });
});

// Debug: login automatically as august sun (admin)
app.use(function(req, res, next) {
  db.cypher({
    query: 'MATCH (user:User {username: {username}}) RETURN user',
      params: {
          username: "august"
      }
  }, function(err, results) {
    results[0].user.isAdmin = true;
    req.login(results[0].user, function(err) {
      next(err);
    });
  });
})

app.use('/', routes);
app.use('/users', users);
app.use('/posts', posts);
app.use('/tournaments', tournaments);

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

function validatePassword(user, password) {
  var truth = false;
  derivedKey = crypto.pbkdf2Sync(password, user.properties.salt.toString(), 4096, 64)
  if (user.properties.password == derivedKey.toString('ascii')) {
    truth = true;
  }
  return truth;
}

module.exports = app;
