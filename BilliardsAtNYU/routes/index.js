var express = require('express');
var router = express.Router();
var db = require('../db.js');
var crypto = require('crypto');
var passport = require('passport');

/* GET home page. */
router.get('/', function(req, res, next) {
  renderWithUser(req, res, 'index', { title: 'Express' });
});

router.get('/about', function(req, res, next) {
  renderWithUser(req, res, 'about');
});

router.get('/tournament', function(req, res, next) {
  renderWithUser(req, res, 'tournament');
});

router.get('/contact', function(req, res, next) {
  renderWithUser(req, res, 'contact');
});

router.post('/contact', function(req, res, next) {
  // store contact logic
});

router.get('/login', function(req, res, next) {
  renderWithUser(req, res, 'login');
});

router.post('/login',
            passport.authenticate('local', { successRedirect: '/testing',
                                             failureRedirect: '/login'}));

router.get('/register', function(req, res, next) {
  renderWithUser(req, res, 'register');
});

router.post('/register', function(req, res, next) {
  
  // check to see if user is already registered
  db.cypher({
    query: "MATCH (n:User { username: {Username} }) RETURN n",
    params: {
      Username: req.body.username,
    },
  }, function(err, results) {
    
    if (!results[0]) {
      var salt = (new Date).getTime() + 5894371985;
      
      // hash and salt
      var derivedKey = crypto.pbkdf2Sync(req.body.password, salt.toString(), 4096, 64);
      
      console.log(derivedKey.toString('ascii'));
      
      db.cypher({
        query: "CREATE (n:User { username: {Username}, password: {Password}, salt: {Salt}})",
        params: {
          Username: req.body.username,
          Password: derivedKey.toString('ascii'),
          Salt: salt
        }
      }, function(err, results) {
        res.redirect('/testing');
      });
    } else {
      res.send("username has already been registered"); // replace with user already registered logic
    }
  });
});

router.get('/logout', function(req, res, next) {
  req.logout();
  renderWithUser(req, res, 'logout');
});

router.get('/testing', function(req, res, next) {
  if (req.user) {
    res.send(req.user);
  } else {
    res.send("Not logged in");
  }
})

function renderWithUser(req, res, route, data) {
  console.log(req.user)
  if (req.user) {
    data.user = req.user.properties;
  }
  console.log(data);
  res.render(route, data);
}

module.exports = router;
