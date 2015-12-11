var active = false;

var empty = false;

window.onload = function() {
    active = true;
    
    $('#tournamentContainer').bind('submit', submitTournament)
    
    // change tournament to most recent tournament
    changeTournament();
}

function submitTournament() {
    
    // Make the tournament object
    var tournament = {};
    
    var tournamentForm = document.getElementById("tournamentContainer");
    
    for (var key in tournamentForm) {
        if (!isNaN(parseInt(key))) {
            if (tournamentForm[key].value === "") {
                alert("All fields are required!");
                return false;
            }
        }
    }
    
    tournament.winner = tournamentForm.winner.value;
    tournament.name = tournamentForm.name.value;
    tournament.newSlug = document.getElementById("tournamentSlug").value;
    // Start making rounds
    tournament.rounds = [];
    
    /*
    tournament.rounds[0] = {
        roundOf: 2,
        raceTo: tournamentForm.raceTo[0].value,
        matches: [{
            player1Name: tournamentForm.player1Name[0].value,
            player2Name: tournamentForm.player2Name[0].value,
            player1Score: tournamentForm.player1Score[0].value,
            player2Score: tournamentForm.player2Score[0].value,
            gameProgression: {}  //unimplemented
        }]
    }
    */
    
    //console.log(tournamentForm.player2Name)
    
    var matchLocationStart = 0;
    for (round = 0; round < 4; round++) {
        var matchesArray = [];
        var pow = Math.pow(2, round);
        matchLocationStart = pow-1;
        for (i = 0; i < pow; i++) {
            matchLocation = matchLocationStart+i;
            matchesArray[i] = {
                player1Name: tournamentForm.player1Name[matchLocation].value,
                player2Name: tournamentForm.player2Name[matchLocation].value,
                player1Score: tournamentForm.player1Score[matchLocation].value,
                player2Score: tournamentForm.player2Score[matchLocation].value,
                gameProgression: [] //unimplemented
            }
        }
        
        tournament.rounds[round] = {
           roundOf: pow*2,
           raceTo: tournamentForm.raceTo[round].value,
           matches: matchesArray
        }
    }
    
    var form = document.createElement("form");
    form.setAttribute("method", "POST");
    form.setAttribute("action", "");
    
    tournamentJSON = JSON.stringify(tournament);
    
    //console.log(tournamentJSON);
    
    $.post(window.location.href, {tournament: tournamentJSON} , function(result) {
        window.location.href = result;
    })
    
    return false;
}

function changeTournament() {
    if (!active) {
        return;
    }
    
    //get new value
    var newTournament = document.getElementById("tournamentSlug").value;
    
    $.getJSON("/tournaments/retrieve?slug=" + newTournament, renderTournament);
}
    
    
function renderTournament(data) {
        
    // This should be the form of the tournament object coming in to be interepeted:
    /*
     *
     * var tournament = {
     *   name: String,
     *   winner: String,
     *   newSlug: String,
     *   rounds: [
     *   {
     *       roundOf: 2
     *       raceTo: Number,
     *       matches: [{
     *       player1Name: String,
     *       player2Name: String,            // <--- the schema for a match
     *       player1Score: Number,
     *       player2Score: Number,
     *       gameProgression: [Number] // 1,2,1,2 indicating who won which game
     *       }]
     *   },
     *   {
     *       roundof: 4
     *       matches: [Match]  //length roundof/2
     *   },
     *   {
     *       roundof: 8
     *       matches: [Match] //length 4
     *   },
     *   {
     *       roundof: 16
     *       matches: [Match] //length 8
     *   }
     *   ]
     * }
     *
     */
    
    if (!data.winner) {
        empty = true;
        data = {
            winner: "",
            rounds: [
                {
                    roundOf: 2,
                    raceTo: 0,
                    matches: [
                        {}
                    ]
                },
                {
                    roundOf: 4,
                    raceTo: 0,
                    matches: [
                        {}, {}
                    ]
                },
                {
                    roundOf: 8,
                    raceTo: 0,
                    matches: [
                        {}, {}, {}, {}
                    ]
                },
                {
                    roundOf: 16,
                    raceTo: 0,
                    matches: [
                        {}, {}, {}, {}, {}, {}, {}, {}
                    ]
                }
            ]
        }
    } else {
        empty = false;
    }
    
    //console.log(data);
    
    var updatedTournament = data;
    
    var tournament = document.getElementById("tournamentContainer");
    
    tournament.innerHTML += "Tournament: "
    var nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.name = "name";
    nameInput.value = updatedTournament.name;
    tournament.appendChild(nameInput);
    tournament.appendChild(document.createElement("br"));
    tournament.appendChild(document.createElement("br"));
    
    winner = document.createElement("div");
    winner.classList.add("winnerdiv");
    winner.innerHTML = "Winner: ";
    var winnerinput = document.createElement("input");
    winnerinput.type = "text";
    winnerinput.name = "winner";
    winnerinput.value = updatedTournament.winner;
    winner.appendChild(winnerinput);
    
    tournament.appendChild(winner);
    tournament.appendChild(document.createElement("br"));
    tournament.appendChild(document.createElement("br"));
    
    // Create and add layer 1 of the tournament
    var layer1 = document.createElement("div");
    
    finals = createMatchTable(updatedTournament.rounds[0].matches[0], false);
    layer1.appendChild(finals);
    
    tournament.appendChild(layer1);
    
    // Create and add layer 1.5 of the tournament
    var layer1_5 = document.createElement("div");
    
    layer1_5.appendChild(createCombiner("4x"));
    
    tournament.appendChild(layer1_5);
    
    // Create and add layer 2 of the tournament
    var layer2 = document.createElement("div");
    
    var elements = []
    
    elements.push(createMatchTable(updatedTournament.rounds[1].matches[0], false));
    elements.push(createSpacing(250));
    elements.push(createMatchTable(updatedTournament.rounds[1].matches[1], false));
    
    addElements(layer2, elements);
    
    tournament.appendChild(layer2);
    
    // Create and add layer 2.5 of the tournament
    var layer2_5 = document.createElement("div");
    
    elements = [];
    
    elements.push(createCombiner("2x"));
    elements.push(createSpacing(200));
    elements.push(createCombiner("2x"));
    
    addElements(layer2_5, elements);
    
    tournament.appendChild(layer2_5);
    
    // Create and add layer 3 of the tournament
    var layer3 = document.createElement("div");
    
    elements = [];
    
    elements.push(createMatchTable(updatedTournament.rounds[2].matches[0], false));
    elements.push(createSpacing(50));
    elements.push(createMatchTable(updatedTournament.rounds[2].matches[1], false));
    elements.push(createSpacing(50));
    elements.push(createMatchTable(updatedTournament.rounds[2].matches[2], false));
    elements.push(createSpacing(50));
    elements.push(createMatchTable(updatedTournament.rounds[2].matches[3], false));
    
    addElements(layer3, elements);
    
    tournament.appendChild(layer3);
    
    // Create and add layer 3.5 of the tournament
    var layer3_5 = document.createElement("div");
    
    elements = [];
    
    elements.push(createCombiner("1x"));
    elements.push(createSpacing(100));
    elements.push(createCombiner("1x"));
    elements.push(createSpacing(100));
    elements.push(createCombiner("1x"));
    elements.push(createSpacing(100));
    elements.push(createCombiner("1x"));
    
    addElements(layer3_5, elements);
    
    tournament.appendChild(layer3_5);
    
    // Create and add layer 4 of the tournament
    var layer4 = document.createElement("div");
    
    elements = [];
    
    elements.push(createMatchTable(updatedTournament.rounds[3].matches[0], true));
    elements.push(createMatchTable(updatedTournament.rounds[3].matches[1], true));
    elements.push(createMatchTable(updatedTournament.rounds[3].matches[2], true));
    elements.push(createMatchTable(updatedTournament.rounds[3].matches[3], true));
    elements.push(createMatchTable(updatedTournament.rounds[3].matches[4], true));
    elements.push(createMatchTable(updatedTournament.rounds[3].matches[5], true));
    elements.push(createMatchTable(updatedTournament.rounds[3].matches[6], true));
    elements.push(createMatchTable(updatedTournament.rounds[3].matches[7], true));
        
    addElements(layer4, elements);
        
    tournament.appendChild(layer4);
    
    var layer5 = document.createElement("div");
    
    var raceTo1 = document.createElement("input");
    raceTo1.name = "raceTo";
    raceTo1.type = "number";
    raceTo1.setAttribute("value", updatedTournament.rounds[0].raceTo);
    var raceTo2 = document.createElement("input");
    raceTo2.name = "raceTo";
    raceTo2.type = "number";
    raceTo2.setAttribute("value", updatedTournament.rounds[1].raceTo);
    var raceTo3 = document.createElement("input");
    raceTo3.name = "raceTo";
    raceTo3.type = "number";
    raceTo3.setAttribute("value", updatedTournament.rounds[2].raceTo);
    var raceTo4 = document.createElement("input");
    raceTo4.name = "raceTo";
    raceTo4.type = "number";
    raceTo4.setAttribute("value", updatedTournament.rounds[3].raceTo);
    
    layer5.innerHTML = "<br>Race To (Finals): ";
    layer5.appendChild(raceTo1);
    layer5.innerHTML += "<br>Race To (Semis): ";
    layer5.appendChild(raceTo2);
    layer5.innerHTML += "<br>Race To (Quarters): ";
    layer5.appendChild(raceTo3);
    layer5.innerHTML += "<br>Race To (Round of 16): ";
    layer5.appendChild(raceTo4);

    tournament.appendChild(layer5);
    
    // Move the bottom back to the bottom
    var bottom = document.getElementById("bottom");
    tournament.removeChild(bottom);
    tournament.appendChild(bottom);
}

function createCombiner(size) {
    var combiner = document.createElement("img");
    combiner.src = "/images/combiner" + size + ".png";
    return combiner;
}

function addElements(layer, elements) {
    for (i = 0; i < elements.length; i++) {
        layer.appendChild(elements[i]);
    }
}

function createSpacing(width) {
    width = width || 100;
    var spacing = document.createElement("div");
    spacing.style.display = "inline-block";
    spacing.style.width = width.toString() + "px";
    return spacing;
}

function createMatchTable(matchDetails, small) {
    
    player1name = matchDetails.player1Name;
    player2name = matchDetails.player2Name;
    player1score = matchDetails.player1Score;
    player2score = matchDetails.player2Score;
    gameProgression = matchDetails.gameProgression;
    
    // Create the match and add styling
    var match = document.createElement("table");
    if (small) {
        match.classList.add("matchtablesmall")
    } else {
        match.classList.add("matchtable");
    }
    
    // Add structure and information
    var player1 = match.insertRow(0);
    var player1namecell = player1.insertCell(0);
    player1namecell.classList.add("playernamecell");
    addMatchInnerValues(player1namecell, player1name, "player1Name", "text");
    
    var player1scorecell = player1.insertCell(1);
    addMatchInnerValues(player1scorecell, player1score, "player1Score", "number");
    
    var player2 = match.insertRow(1);
    var player2namecell = player2.insertCell(0);
    player2namecell.classList.add("playernamecell");
    addMatchInnerValues(player2namecell, player2name, "player2Name", "text");
    
    var player2scorecell = player2.insertCell(1);
    addMatchInnerValues(player2scorecell, player2score, "player2Score", "number");
    
    // return created match
    return match;
}

function addMatchInnerValues(cell, content, cellName, type) {
    content = content || "0";
    
    var textbox = document.createElement("input");
    textbox.type = type;
    textbox.name = cellName;
    textbox.value = content;
    cell.appendChild(textbox);
}