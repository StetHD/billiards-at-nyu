var express = require('express');
var router = express.Router();
var db = require('../db.js');
var crypto = require('crypto');
var passport = require('passport');
var helper = require('./helper.js');

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
      
      helper.renderWithUser(req, res, 'index', data);
    });
  });
});
router.get('/home', function (req, res, next) {
  res.redirect('/');
});

router.get('/newpost', function(req, res, next) {
  if (req.user) {
    if (req.user.isAdmin) {
      helper.renderWithUser(req, res, 'newpost');
      return;
    }
  }
  res.send("401 Unauthorized");
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
      query: "CREATE (n:Post {title: {Title}, content: {Content}, date: {Date}, postnumber: {PostNum}, author: {Author}}) RETURN n",
      params: {
        Title: req.body.title,
        Content: req.body.content,
        Date: Date.now(),
        PostNum: count + 1,
        Author: req.user.properties.username
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
  
  
  if (req.user) {
    if (req.user.isAdmin) {
      makeFirstQuery();
      return;
    }
  }
  res.send("401 Unauthorized");
})

router.get('/about', function(req, res, next) {
  helper.renderWithUser(req, res, 'about');
});

router.get('/tournaments', function(req, res, next) {
  db.cypher({
    query: "MATCH (n:Tournament) RETURN n"
  }, function(err, results) {
    
    var tournaments = [];
    
    for (i = 0; i < results.length; i++) {
      var index = tournaments.length;
      if (index == 0) {
        tournaments[0] = results[i].n.properties;
        continue;
      }
      for (j = 0; j < tournaments.length; j++) {
        if (helper.tourneyNumber(tournaments[j]) < helper.tourneyNumber(results[i].n.properties)) {
          index = j;
          break;
        }
      }
      j = tournaments.length - 1;
      while (j >= index) {
        tournaments[j+1] = tournaments[j];
        j--;
      }
      tournaments[index] = results[i].n.properties;
    }
    
    console.log(tournaments);
    
    helper.renderWithUser(req, res, 'tournaments', {"tournaments": tournaments});
  })
});

router.get('/players', function(req, res, next) {
  helper.renderWithUser(req, res, 'players');
});

router.get('/contact', function(req, res, next) {
  helper.renderWithUser(req, res, 'contact');
});

router.post('/contact', function(req, res, next) {
  // store contact logic
});

router.get('/login', function(req, res, next) {
  helper.renderWithUser(req, res, 'login');
});

router.post('/login',
            passport.authenticate('local', { successRedirect: '/testing',
                                             failureRedirect: '/login'}));

router.get('/register', function(req, res, next) {
  if (req.user) {
    res.redirect('/users');
  } else {
    helper.renderWithUser(req, res, 'register');
  }
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
  helper.renderWithUser(req, res, 'logout');
});

router.get('/testing', function(req, res, next) {
  if (req.user) {
    res.send(req.user);
  } else {
    res.send("Not logged in");
  }
})

router.get('/dbquery', function(req, res, next) {
  if (req.user) {
    console.log(req.user);
    if (req.user.isAdmin) {
      helper.renderWithUser(req, res, 'dbquery');
      return;
    }
  }
  res.send("401 Unauthorized");
});

router.post('/dbquery', function(req, res, next) {
  if (req.user) {
    if (req.user.isAdmin) {
      console.log(req.body.query);
      console.log(JSON.parse(req.body.params || "{}"));
      db.cypher({
        query: req.body.query,
        params: JSON.parse(req.body.params || "{}")
      }, function (err, results) {
        var message = "err: " + (err || " ").toString() + "\nresults: [\n";
        for (i = 0; i < results.length; i++) {
          message += JSON.stringify(results[i]) + ",\n";
        }
        message += "]"
        res.send(message);
      });
      return;
    }
  }
  res.send("401 Unauthorized");
});

router.get('/makeadmin', function(req, res, next) {
  if (!req.user) {
    res.send("not logged in");
    return;
  }
  db.cypher({
    query: "MATCH (n:User {username: {Username}}) SET n :Admin",
    params: {
      Username: req.user.properties.username
    }
  }, function(err, results) {
    res.redirect('/');
  })
});

module.exports = router;
