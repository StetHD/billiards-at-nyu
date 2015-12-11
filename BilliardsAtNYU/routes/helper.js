helper = {};

helper.renderWithUser = function(req, res, route, data) {
  if (!data) {
    data = {};
  }
  //console.log("User: " + req.user);
  if (req.user) {
    data.user = req.user;
    if (data.user.labels.indexOf("Admin") != -1) {
      data.admin = true;
    }
  }
  //console.log(data);
  res.render(route, data);
}

helper.tourneyNumber = function(tournament) {
  var number = helper.findYear(tournament);
  if (tournament.slug.slice(0,4) === "fall") {
    number += "2";
  } else {
    number += "1";
  }
  return number;
}

helper.findYear = function(tournament) {
  return tournament.slug.slice(-4);
}

helper.findPlayersForMatch = function(results, currentMatchNumber) {
  var i;
  var players = [];
  for (i = 0; i < results.length; i++) {
    if (results[i].r1.properties.matchnumber == currentMatchNumber) {
      players.push(results[i]);
    }
  }
  return players;
}

helper.findPlayerForMatch = function(match, playernumber) {
  if (match[0].r2.properties.playernumber == playernumber) {
    return match[0];
  } else {
    return match[1];
  }
}


helper.addMatch = function(tournamentSlug, raceTo, roundOf, matchNumber, match, transaction, callback) {
  // cypher query to add a match, with player 1, player 2 and attached to a specific tournament
  console.log("starting add match query");
  transaction.cypher({
    query: 'MATCH (n:Tournament {slug: {Slug}}) MERGE (a:Player {playername:{Player1Name}}) MERGE (b:Player {playername: {Player2Name}}) ' +
           'CREATE p=(a)-[:PLAYED_IN {playernumber: 1}]->(m:Match {raceto: {RaceTo}, player1score: {Player1Score}, player2score: {Player2Score}, games: {ProgressionOfGames}})<-[:PLAYED_IN {playernumber: 2}]-(b) ' +
           'CREATE (m)-[:PART_OF {roundof: {RoundOf}, matchnumber: {MatchNumber}}]->(n)',
    params: {
            Player1Name: match.player1Name,
            Player2Name: match.player2Name,
            Slug: tournamentSlug,
            RaceTo: raceTo,
            Player1Score: match.player1Score,
            Player2Score: match.player2Score,
            ProgressionOfGames: match.gameProgression || [],  //may not be implemented yet
            RoundOf: roundOf,
            MatchNumber: matchNumber
    }
  }, callback)
}

helper.compileMatches = function(results) {
  
  matches = [];
  for (i = 0; i < results.length; i++) {
   
    var match = {
      id: results[i]["id(n)"],
      date: results[i].n.properties.date,
      opponent: results[i].q.properties.playername,
      playerNumber: results[i].r1.properties.playernumber,
      gameProgression: results[i].n.properties.games,
      isTournamentMatch: false
    }
        
    if (match.playerNumber == 1) {
      match.playerScore = results[i].n.properties.player1score;
      match.opponentScore = results[i].n.properties.player2score;
    } else {
      match.playerScore = results[i].n.properties.player2score;
      match.opponentScore = results[i].n.properties.player1score;
    }
        
    if (results[i].r2 != null) {
      match.isTournamentMatch = true;
      match.roundOf = results[i].r2.properties.roundof;
      match.tournamentName = results[i].t.properties.name;
    }
        
    index = matches.length;
    for (j = matches.length; j > 0; j--) {
      if (match.id > matches[j-1].id) {
        index = j-1;
      }
    }
        
    matches.splice(index, 0, match);
  }
  
  return matches;
}


module.exports = helper;