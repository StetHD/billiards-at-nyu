var express = require('express');
var router = express.Router();
var db = require('../db.js');
var crypto = require('crypto');
var passport = require('passport');
var helper = require('./helper.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  
  var data = {};
  
  data.title = "Billiards@NYU";
  
  // get most recent posts from database
  db.cypher({
    query: "MATCH (n:PostCount) RETURN n"
  }, function(err, results) {
    
    postCount = results[0].n.properties.count || 0;
    
    var numberOfPosts = 5;
    
    var Nums = []
    
    for (i = 0; i < numberOfPosts; i++) {
      Nums.push(postCount-i);
    }
    
    db.cypher({
      query: "MATCH (n:Post) WHERE n.postnumber IN { nums } RETURN n",
      params: {
        nums: Nums
      }
    }, function(err, results) {
      console.log(results);
      data.posts = [];
      
      for (i = postCount; i >= postCount-numberOfPosts+1; i--) {
        for (j = 0; j < numberOfPosts; j++) {
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

router.get('/about', function(req, res, next) {
  var data = {};
  data.title = "About"
  helper.renderWithUser(req, res, 'about', data);
});

router.get('/players', function(req, res, next) {
  
  var data = {};
  data.title = "Players";
  
  if (req.query.playerName) {
    
    console.log(req.query.playerName);
    
    db.cypher({
      query: "MATCH (n:Match)<-[r1:PLAYED_IN]-(m:Player {playername : {Playername}}) " +
             "MATCH (n)<-[:PLAYED_IN]-(q) WHERE NOT q.playername = {Playername} " +
             "OPTIONAL MATCH  (t:Tournament)<-[r2:PART_OF]-(n) " +
             "RETURN n, id(n), r1, m, q, t, r2",
      params: {
        Playername: req.query.playerName
      }
    }, function(err, results) {
      data.playerName = req.query.playerName;
      
      /*
       * Match form:
       * match = [{
        id: Number,
        date: Date,
        opponent: String,
        playerScore: Number,
        playerNumber: Number,
        opponentScore: Number,
        gameProgression: [Number],
        isTournamentMatch: Boolean, (if true, then the rest)
        tournamentName: String,
        roundOf: Number
       }]
       *
       */
      data.matches = helper.compileMatches(results);
      
      console.log(data)
      
      helper.renderWithUser(req, res, 'players', data);
    });
  } else {
    helper.renderWithUser(req, res, 'players', data);
  }
});

router.post("/players", function(req, res, next) {
  
    db.cypher({
      query: "MATCH (n:Match)<-[r1:PLAYED_IN]-(m:Player {playername : {Playername}}) " +
             "MATCH (n)<-[:PLAYED_IN]-(q) WHERE NOT q.playername = {Playername} " +
             "OPTIONAL MATCH  (t:Tournament)<-[r2:PART_OF]-(n) " +
             "RETURN n, id(n), r1, m, q, t, r2",
      params: {
        Playername: req.body.playerName
      }
    }, function(err, results) {
      
      if (!results[0]) {
        res.json({});
        return;
      }
      
      var data = {}
      
      data.playerName = req.body.playerName;
      
      /*
       * Match form:
       * match = [{
        id: Number,
        date: Date,
        opponent: String,
        playerScore: Number,
        playerNumber: Number,
        opponentScore: Number,
        gameProgression: [Number],
        isTournamentMatch: Boolean, (if true, then the rest)
        tournamentName: String,
        roundOf: Number
       }]
       *
       */
      data.matches = helper.compileMatches(results);
      
      console.log(data);
      
      res.json(data);
    });
});

router.get('/contact', function(req, res, next) {
  var data = {};
  data.title = "Contact Us";
  helper.renderWithUser(req, res, 'contact', data);
});

router.post('/contact', function(req, res, next) {
  // store contact logic
});

router.get('/login', function(req, res, next) {
  var data = {};
  data.title = "Login";
  helper.renderWithUser(req, res, 'login', data);
});

router.post('/login',
            passport.authenticate('local', { successRedirect: '/',
                                             failureRedirect: '/login'}));

router.get('/register', function(req, res, next) {
  if (req.user) {
    res.redirect('/users');
  } else {
    var data = {}
    data.title = "Register";
    helper.renderWithUser(req, res, 'register', data);
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
  var data = {};
  data.title = "Logout";
  req.logout();
  helper.renderWithUser(req, res, 'logout', data);
});

router.get('/testing', function(req, res, next) {
  if (req.user) {
    res.send(req.user);
  } else {
    res.send("Not logged in");
  }
})

router.get('/dbquery', function(req, res, next) {
  var data = {};
  data.title = "DBQuery";
  if (req.user) {
    console.log(req.user);
    if (req.user.isAdmin) {
      helper.renderWithUser(req, res, 'dbquery', data);
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
