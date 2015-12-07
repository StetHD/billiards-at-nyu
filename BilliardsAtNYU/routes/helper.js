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

/*
function addMatch() {
  // cypher query to add a match, with player 1, player 2 and attached to a specific tournament
  db.cypher({
    query: 'MATCH (a:Player {playername:{Player1Name}), (b:Player {playername: {Player2Name}),  (n:Tournament {semester: {TournamentName}})' +
           'CREATE p =(a)-[:PLAYED_IN {playernumber: 1}]->(m:Match {raceto: {RaceTo}, player1score: {Player1Score}, player2score: {Player2Score}, games: {ProgressionOfGames}})<-[:PLAYED_IN {playernumber: 2}]-(b)' +
           'CREATE (m)-[:PART_OF {roundof: {RoundOf}, matchnumber: {MatchNumber}}]->(n)',
    params: {
            Player1Name:
            Player2Name:
            TournamentName:
            RaceTo:
            Player1Score:
            Player2Score:
            ProgressionOfGames:
            RoundOf:
            MatchNumber:
    }
  })
}
*/

helper = {};

helper.renderWithUser = renderWithUser;

module.exports = helper;