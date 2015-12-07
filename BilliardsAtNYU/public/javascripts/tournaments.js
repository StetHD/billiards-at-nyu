var active = false;

window.onload = function() {
    active = true;
    
    // change tournament to most recent tournament
}

function changeTournament() {
    if (!active) {
        return;
    }
    
    //get new value
    var newTournament = document.getElementById("tournamentSelect").value;
    document.getElementById("tournamentcontainer").innerHTML = newTournament;
    
};