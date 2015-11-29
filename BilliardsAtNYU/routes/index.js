var express = require('express');
var router = express.Router();
var db = require('../db.js');

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

router.post('/login', function(req, res, next) {
  // logic to manage login
})

router.get('/logout', function(req, res, next) {
  // logic to manage logout
  res.render('logout');
});

router.get('/testing', function(req, res, next) {
  res.send("HELLO WORLD");
})

module.exports = router;
