var express = require('express');
var router = express.Router();
var db = require('../db.js');
var helper = require('./helper.js');

router.get('/', function(req, res, next) {
  var data = {};
  data.title = "Tournaments";
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
    
    //console.log(tournaments);
    
    data.tournaments = tournaments;
    
    helper.renderWithUser(req, res, 'tournaments', data);
  })
});

router.get('/signup', function(req, res, next) {
    var data = {};
    data.title = "Signup"
    helper.renderWithUser(req, res, 'signup', data);
});

router.post('/signup', function(req, res, next) {
    
    tournament = "spring-2016";
    
    console.log(req.body);
    
    db.cypher({
      query: "CREATE (n:Signup {tournament:{Tournament}, name:{Name}, phone:{Phone}, email:{Email}, skill:{Skill}, comment:{Comment}}) RETURN (n)",
      params: {
        Tournament: tournament,
        Name: req.body.name,
        Phone: req.body.phone,
        Email: req.body.email,
        Skill: req.body.skill,
        Comment: req.body.comment
      }
    }, function(err, results) {
      var data = {};
      console.log(results);
      data.title = "Signup";
      data.name = results[0].n.properties.name;
      helper.renderWithUser(req, res, 'signupconfirm', data);
    })
});

router.get('/retrieve', function(req, res, next) {
    
    //console.log(req.query);
    
    // setup tournament container
    var tournament = {};
    tournament.rounds = []
    var tournamentJSON;
    
    // setup indexes
    var roundOf = 2;
    var currentRound = 0;
    
    function makeFirstQuery() {
        db.cypher({
            query: "MATCH (m:Tournament {slug:{Slug}})<-[:WON]-(n) RETURN n,m",
            params: {
                Slug: req.query.slug
            }
        }, makeSecondQuery);
    };
    
    function makeSecondQuery(err, results) {
        //console.log(results);
        if (!results[0]) {
            res.json("{}");
            return;
        }
        tournament.winner = results[0].n.properties.playername;
        tournament.name = results[0].m.properties.name;
        db.cypher({
            query: "MATCH (:Tournament {slug:{Slug}})<-[r1:PART_OF {roundof: {Roundof}}]-(n:Match)<-[r2:PLAYED_IN]-(m:Player) RETURN n,m,r1,r2",
            params: {
                Slug: req.query.slug,
                Roundof: roundOf
            }
        }, makeRoundQuery);
    };
    
    function makeRoundQuery(err, results) {
        
        if (results.length == 0) {
            finish(err);
            return;
        }
        
        tournament.rounds[currentRound] = {};
        tournament.rounds[currentRound].roundOf = roundOf;
        tournament.rounds[currentRound].raceTo = results[0].n.properties.raceto;
        tournament.rounds[currentRound].matches = [];
        
        var lowestMatchNumber = 15;
        for (i = 0; i < results.length; i++) {
            if (results[i].r1.properties.matchnumber < lowestMatchNumber) {
                lowestMatchNumber = results[i].r1.properties.matchnumber;
            }
        }
        
        for (i = 0; i < results.length/2; i++) {
            var currentMatch = {};
            var currentMatchNumber = lowestMatchNumber+i;
            var matchPlayers = helper.findPlayersForMatch(results, currentMatchNumber)
            var player1 = helper.findPlayerForMatch(matchPlayers, 1);
            var player2 = helper.findPlayerForMatch(matchPlayers, 2);
            currentMatch.player1Name = player1.m.properties.playername;
            currentMatch.player2Name = player2.m.properties.playername;
            currentMatch.player1Score = player1.n.properties.player1score;
            currentMatch.player2Score = player2.n.properties.player2score;
            currentMatch.gameProgression = player1.n.properties.games;
            tournament.rounds[currentRound].matches.push(currentMatch);
        }
        
        roundOf = roundOf*2;
        currentRound++;
        
        db.cypher({
            query: "MATCH (:Tournament {slug:{Slug}})<-[r1:PART_OF {roundof: {Roundof}}]-(n:Match)<-[r2:PLAYED_IN]-(m:Player) RETURN n,m,r1,r2",
            params: {
                Slug: req.query.slug,
                Roundof: roundOf
            }
        }, makeRoundQuery);
    }
    
    function finish(err) {
        if (err) throw err;
        //tournamentJSON = JSON.stringify(tournament, null, 3);
        //console.log(tournamentJSON);
        console.log("tournament has been sent");
        res.json(tournament);
    }
    
    makeFirstQuery();
});

router.get('/edit', function(req, res, next) {
  
    var data = {}
    data.title = "Edit Tournament";
    
    //console.log(req.query);
    
    if (req.user) {
        if (req.user.isAdmin) {
            //console.log("sending edittournaments");
            data.tournament = req.query.tournamentSlug
            helper.renderWithUser(req, res, 'edittournaments', data);
            return;
        }
    }
    res.send("401 Unauthorized");
});

router.post('/edit', function(req, res, next) {
  
  console.log("editing tournament");
  
  var tournament = req.body.tournament;
  
  var oldSlug = req.query.tournamentSlug;
  var newSlug;
  
  var currentRound;
  var currentMatchIndex;
  var currentMatchNumber;
  var errors = [];
  
  if (req.user) {
    if (req.user.isAdmin) {
      
      tournament = JSON.parse(tournament);
      
      //console.log(tournament);
      
      newSlug = tournament.newSlug;
      
      var transaction = db.beginTransaction();
      
      makeFirstQuery();
      return;
    }
  }
  
  res.send("401 Unauthorized");
      
  function makeFirstQuery() {
    console.log("making first query");
    transaction.cypher({
      query: "MATCH (n:Tournament {slug: {Slug}})<-[r1]-(m)<-[r2]-(q) RETURN n,m,q",
      params: {
        Slug: oldSlug || "REPLACEMENT TEXT"
      }
    }, makeDeleteQuery);
  }
  
  function makeDeleteQuery(err, results) {
    console.log("making delete query");
    if (results[0]) {
      transaction.cypher({
        query: "MATCH (n:Tournament {slug: {Slug}})<-[r1:PART_OF]-(m)<-[r2:PLAYED_IN]-(q) DETACH DELETE n,m",
        params: {
          Slug: oldSlug || "REPLACEMENT TEXT"
        }
      }, makeCreateQuery)
    } else {
      console.log("didnt delete anything, moving on");
      makeCreateQuery();
    }
  }
  
  function makeCreateQuery(err, results) {
    console.log("making create query");
    currentRound = tournament.rounds.length - 1;
    currentMatchIndex = 0;
    currentMatchNumber = 1;
    transaction.cypher({
      query: "CREATE (n:Tournament {slug: {Slug}, name: {Name}})",
      params: {
        Slug: newSlug,
        Name: tournament.name
      }
    }, makeCreateWinnerQuery);
  }
  
  function makeCreateWinnerQuery(err, results) {
    console.log("making createWinner query")
    //console.log(tournament.winner);
    transaction.cypher({
      query: "MATCH (n:Tournament {slug: {Slug}}) MERGE (m:Player {playername: {WinnerName}}) CREATE (n)<-[:WON]-(m)",
      params: {
        Slug: newSlug,
        WinnerName: tournament.winner
      }
    }, makeCreateMatchQuery)
  }
  
  function makeCreateMatchQuery(err, results) {
    if (err) {
      errors.push(err);
    }
    console.log("making createMatch query");
    if (currentRound == -1) {
      finish();
      return;
    } else if (currentMatchIndex == tournament.rounds[currentRound].matches.length) {
      currentMatchIndex = 0;
      currentRound--;
      makeCreateMatchQuery();
      return;
    }
    
    //console.log("current round is " + currentRound);
    //console.log("current match index is " + currentMatchIndex);
    //console.log("current match number is " + currentMatchNumber);
    //console.log(tournament.rounds[currentRound].matches[currentMatchIndex]);
    
    helper.addMatch(newSlug,
                    tournament.rounds[currentRound].raceTo,
                    tournament.rounds[currentRound].roundOf,
                    currentMatchNumber,
                    tournament.rounds[currentRound].matches[currentMatchIndex],
                    transaction,
                    makeCreateMatchQuery);
    
    currentMatchIndex++;
    currentMatchNumber++;
  }
  
  function finish() {
    if (errors[0]) throw errors[0];
    
    console.log("finished transaction!");
    transaction.commit(done);
  }
  
  function done(err) {
    if (err) throw err;
    console.log("committed");
    res.send('/tournaments');
  }
});


module.exports = router;