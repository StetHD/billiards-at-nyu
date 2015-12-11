window.onload = function() {
    
    $('#playerQuery').bind('submit', queryPlayer);
    
}

function queryPlayer() {
    
    console.log("submitting");
    
    var name = document.getElementById("playerQuery").playerName.value;
    
    if (name == "") {
        alert("Please enter a name!");
        return false;
    }
    
    $.post(window.location.href, {playerName: name} , renderPlayer, 'json');
    return false;
}

function renderPlayer(result) {
    
    var newContainer = document.createElement("div");
    var oldContainer = document.getElementById("playerContainer");
    newContainer.id = oldContainer.id;
    
    if (result.playerName) {
        
        var playerStats = document.createElement("div");
        playerStats.classList.add("playerstats");
        playerStats.innerHTML = "<h3>" + result.playerName + "</h3><p>Player Rank: " + (result.playerRank || "") + "</p>";
        newContainer.appendChild(playerStats);
        
        var playerMatches = document.createElement("div");
        playerMatches.classList.add("playermatches");
        
        var inner = document.createElement("div");
        inner.classList.add("inner");
        inner.innerHTML = "<h3>Recent Matches</h3>";
        
        for (i = 0; i < result.matches.length; i++) {
            inner.innerHTML += "<hr class='lightcolor'> " +
                               "Against: " + result.matches[i].opponent + " <br>" +
                               "Score: (" + result.matches[i].playerScore + " - " + result.matches[i].opponentScore + ") (Player - Opponent) <br>" +
                               "Date: " + (result.matches[i].date || "") + " <br>";
            if (result.matches[i].isTournamentMatch) {
                inner.innerHTML += "(Tournament Match) <br>" +
                                   "Tournament: " + result.matches[i].tournamentName + " <br>" +
                                   "Round Of: " + result.matches[i].roundOf + " <br>";
            }
        }
        
        playerMatches.appendChild(inner);
        newContainer.appendChild(playerMatches);    
    } else {
        newContainer.innerHTML = "Not found!";
    }
    
    var parent = oldContainer.parentElement;
    parent.removeChild(oldContainer);
    parent.appendChild(newContainer);
    
}