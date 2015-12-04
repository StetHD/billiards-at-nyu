var express = require('express');
var router = express.Router();
var db = require('../db.js');
var crypto = require('crypto');
var passport = require('passport');

/* GET home page. */
router.get('/', function(req, res, next) {
  
  // get most recent posts from database
  db.cypher({
    query: "MATCH (n:PostCount) RETURN n"
  }, function(err, results) {
    
    postCount = results[0].n.properties.count || 0;
    
    db.cypher({
      query: "MATCH (n:Post) WHERE n.postnumber IN { nums } RETURN n",
      params: {
        nums: [postCount, postCount-1, postCount-2]
      }
    }, function(err, results) {
      console.log(results);
      var data = {posts: []};
      
      for (i = postCount; i >= postCount-2; i--) {
        for (j = 0; j < 3; j++) {
          if (results[j]) {  
            if (results[j].n.properties.postnumber == i) {
              data.posts[postCount-i] = results[j].n.properties;
            }
          }
        }
      }
      
      //console.log(data);
      
      renderWithUser(req, res, 'index', data);
    });
  });
});

router.get('/newpost', function(req, res, next) {
  if (!req.user) {
    res.send("401 Unauthorized");
  } else if (req.user.labels.indexOf("Admin") != -1) {
    renderWithUser(req, res, 'newpost');
  } else {
    res.send("401 Unauthorized");
  }
})

router.post('/newpost', function(req, res, next) {
  var transaction = db.beginTransaction();
  
  function makeFirstQuery() {
    transaction.cypher({
      query: "MATCH (n:PostCount) RETURN n"
    }, makeSecondQuery);
  }
  
  function makeSecondQuery(err, results) {
    var count = results[0].n.properties.count || 0;
    transaction.cypher({
      query: "CREATE (n:Post {title: {Title}, content: {Content}, date: {Date}, postnumber: {PostNum}}) RETURN n",
      params: {
        Title: req.body.title,
        Content: req.body.content,
        Date: Date.now(),
        PostNum: count + 1
      }
    }, makeThirdQuery);
  }
  
  function makeThirdQuery(err, results) {
    count = results[0].n.properties.postnumber;
    transaction.cypher({
      query: "MATCH (n:PostCount) SET n.count = {Count}",
      params: {
        Count: count
      }
    }, finish);
  }
  
  function finish(err, results) {
    if (err) throw err;
    transaction.commit(done);
  }
  
  function done(err) {
    if (err) throw err;
    console.log("new post transaction commited");
    res.redirect('/');
  }
  
  makeFirstQuery();
})

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
  if (!data) {
    data = {};
  }
  console.log("User: " + req.user);
  if (req.user) {
    data.user = req.user;
    if (data.user.labels.indexOf("Admin") != -1) {
      data.admin = true;
    }
  }
  //console.log(data);
  res.render(route, data);
}

module.exports = router;
