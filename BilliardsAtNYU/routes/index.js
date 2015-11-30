var express = require('express');
var router = express.Router();
var db = require('../db.js');
var crypto = require('crypto');
var passport = require('passport');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/about', function(req, res, next) {
  res.render('about');
});

router.get('/tournament', function(req, res, next) {
  res.render('tournament');
});

router.get('/contact', function(req, res, next) {
  res.render('contact');
});

router.post('/contact', function(req, res, next) {
  // store contact logic
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.post('/login', function (req, res, next) {
  console.log("authentication started");
  passport.authenticate('local', function(err, user, info) {
    console.log("authentication ended");
    if (!user) {
      return res.redirect('/login');
    }
    console.log(user);
    res.redirect('/testing');
  })(req, res, next);
});

router.get('/register', function(req, res, next) {
  res.render('register');
});

router.post('/register', function(req, res, next) {
  // register logic
  var salt = (new Date).getTime() + 5894371985;
  console.log(req.body.password);
  crypto.pbkdf2(req.body.password, salt.toString(), 4096, 64, function(err, derivedKey) {
    console.log(derivedKey.toString('ascii'));
    db.cypher({
      query: "CREATE (n:User { username: {Username}, password: {Password}, salt: {Salt}})",
      params: {
        Username: req.body.username,
        Password: derivedKey.toString('ascii'),
        Salt: salt
      }
    });
  });
  res.redirect('/testing');
})

router.get('/logout', function(req, res, next) {
  // logic to manage logout
  res.render('logout');
});

router.get('/testing', function(req, res, next) {
  res.send("HELLO WORLD");
})

function register(password) {
  //code
}

function saltAndHash(user, password) {
  //code
}

module.exports = router;
