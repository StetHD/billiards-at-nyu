var active = false;

var empty = false;

window.onload = function() {
    active = true;
    
    if (window.location.href.indexOf("edit") > -1) {
        edit = true;
    }
    
    $('#tournamentSelect').bind('change', changeTournament);
    
    // change tournament to most recent tournament
    changeTournament();
}

function changeTournament() {
    if (!active) {
        return;
    }
    
    //get new value
    console.log(document.getElementById("tournamentSelect").value);
    console.log(document.getElementById("tournamentSelect").innerHTML);
    var newTournament = document.getElementById("tournamentSelect").value;
    
    var editHidden = document.getElementById("editTourney");
    if (editHidden) {
        editHidden.value = newTournament;
    }
    
    $.getJSON("/tournaments/retrieve?slug=" + newTournament, renderTournament);
}
    
    
function renderTournament(data) {
        
    // This should be the form of the tournament object coming in to be interepeted:
    /*
     *
     * var tournament = {
     *   name: String,
     *   winner: String,
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
    
    console.log(data);
    
    var updatedTournament = data;
    
    var oldTournament = document.getElementById("tournamentContainer");
    
    var newTournament = document.createElement("div");
    newTournament.id = oldTournament.id;
    newTournament.classList.add("tournamentcontainer");
    
    winner = document.createElement("div");
    winner.classList.add("winnerdiv");
    winner.innerHTML = "<h2>Winner: " + updatedTournament.winner + "!</h2>";
    
    newTournament.appendChild(winner);
    newTournament.appendChild(document.createElement("br"));
    newTournament.appendChild(document.createElement("br"));
    
    // Create and add layer 1 of the tournament
    var layer1 = document.createElement("div");
    
    finals = createMatchTable(updatedTournament.rounds[0].matches[0], false);
    layer1.appendChild(finals);
    
    newTournament.appendChild(layer1);
    
    // Create and add layer 1.5 of the tournament
    var layer1_5 = document.createElement("div");
    
    layer1_5.appendChild(createCombiner("4x"));
    
    newTournament.appendChild(layer1_5);
    
    // Create and add layer 2 of the tournament
    var layer2 = document.createElement("div");
    
    var elements = []
    
    elements.push(createMatchTable(updatedTournament.rounds[1].matches[0], false));
    elements.push(createSpacing(250));
    elements.push(createMatchTable(updatedTournament.rounds[1].matches[1], false));
    
    addElements(layer2, elements);
    
    newTournament.appendChild(layer2);
    
    // Create and add layer 2.5 of the tournament
    var layer2_5 = document.createElement("div");
    
    elements = [];
    
    elements.push(createCombiner("2x"));
    elements.push(createSpacing(200));
    elements.push(createCombiner("2x"));
    
    addElements(layer2_5, elements);
    
    newTournament.appendChild(layer2_5);
    
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
    
    newTournament.appendChild(layer3);
    
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
    
    newTournament.appendChild(layer3_5);
    
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
        
    newTournament.appendChild(layer4);
    
    // Remove the old tournament, add in the new tournament
    parentDiv = oldTournament.parentElement;
    parentDiv.removeChild(oldTournament);
    parentDiv.appendChild(newTournament);
    
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
    
    if (!empty) {
        player1name = normalizeName(player1name, small);
        player2name = normalizeName(player2name, small);
    }
    
    // Add structure and information
    var player1 = match.insertRow(0);
    var player1namecell = player1.insertCell(0);
    player1namecell.classList.add("playernamecell");
    addMatchInnerValues(player1namecell, player1name);
    
    var player1scorecell = player1.insertCell(1);
    addMatchInnerValues(player1scorecell, player1score);
    
    var player2 = match.insertRow(1);
    var player2namecell = player2.insertCell(0);
    player2namecell.classList.add("playernamecell");
    addMatchInnerValues(player2namecell, player2name);
    
    var player2scorecell = player2.insertCell(1);
    addMatchInnerValues(player2scorecell, player2score);
    
    // return created match
    return match;
}

function addMatchInnerValues(cell, content) {
    content = content || "";
    cell.innerHTML = content;
}

function normalizeName(name, small) {
    var max;
    if (small) {
        max = 6;
    } else {
        max = 13;
    }
    if (name.length > max) {
        name = name.slice(0,max-2);
        name += "...";
    }
    return name;
}