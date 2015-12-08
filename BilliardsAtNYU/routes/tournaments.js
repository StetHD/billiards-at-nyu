var express = require('express');
var router = express.Router();
var db = require('../db.js');
var helper = require('./helper.js');

router.get('/', function(req, res, next) {
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

router.get('/retrieve', function(req, res, next) {
    
    console.log(req.query);
    
    // setup tournament container
    var tournament = {};
    tournament.rounds = []
    var tournamentJSON;
    
    // setup indexes
    var roundOf = 2;
    var currentRound = 0;
    
    function makeFirstQuery() {
        db.cypher({
            query: "MATCH (:Tournament {slug:{Slug}})<-[:WON]-(n) RETURN n",
            params: {
                Slug: req.query.slug
            }
        }, makeSecondQuery);
    };
    
    function makeSecondQuery(err, results) {
        tournament.winner = results[0].n.properties.playername;
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
        tournamentJSON = JSON.stringify(tournament, null, 3);
        console.log(tournamentJSON);
        console.log("tournament has been sent");
        res.json(tournament);
    }
    
    makeFirstQuery();
})


module.exports = router;