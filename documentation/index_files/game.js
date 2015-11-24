document.getElementById("startButton").addEventListener('click', start);

function start() {
    
    document.getElementById("startForm").style.visibility = "hidden";
    
    var numSymbols = document.getElementById("numSymbols").value || 4;
    
    if (numSymbols > 8) numSymbols = 8;
    if (numSymbols < 1) numSymbols = 1;
    
    var symbols = ['\u2764', '\u264e', '\u2600', '\u2605', '\u2602', '\u265e', '\u262f', '\u262d'];
    
    var symbolsSession = symbols.slice(0,numSymbols);
    
    initGameBoard(symbolsSession);
    
    document.getElementById("testing").innerHTML = symbols[0];
    
}

function initGameBoard(symbolsSession) {
    
    // Generate backend game
    var numSymbols = symbolsSession.length;
    var width = Math.sqrt(numSymbols*2);
    var height;
    
    if (width%1 !== 0) {
        width = Math.ceil(width);
    }
    height = width;
    
    var symbolsToUse = symbolsSession.concat(symbolsSession);
    
    symbolsToUse = shuffleArray(symbolsToUse);
    
    var symbolGrid = [];
    
    for (var i = 0; i < height; i++) {
        symbolGrid[i] = [];
        for (var j = 0; j < width; j++) {
            symbolGrid[i][j] = symbolsToUse.pop();
        }
    }
    
    console.log(symbolGrid);
    
    // Generate frontend game
    board = document.createElement('table');
    var cardClicked = null;
    var guesses = 0;
    document.getElementById("game").innerHTML += "Number of guesses: ";
    var guessesSpan = document.createElement('span');
    guessesSpan.innerHTML = 0;
    document.getElementById("game").appendChild(guessesSpan);
    document.getElementById("game").innerHTML += "<br><br>";
    for (var i = 0; i < symbolGrid.length; i++) {
        var row = board.insertRow(i);
        for (var j = 0; j < symbolGrid[0].length; j++) {
            var cell = row.insertCell(j);
            if (symbolGrid[i][j]) {
                cell.id = i.toString() + j.toString();
                cell.classList.add("cardDown");
                var symbolDiv = document.createElement('div');
                symbolDiv.id = cell.id + "symbol";
                symbolDiv.classList.add("card");
                symbolDiv.classList.add("cardDown");
                symbolDiv.innerHTML = symbolGrid[i][j];
                cell.addEventListener('click',
                                           function(event) {
                                            element = document.getElementById(event.target.id);
                                            elementDiv = document.getElementById(element.id + "symbol");
                                            if (cardClicked == null) {
                                                flip(element.id);
                                                cardClicked = elementDiv;
                                            } else {
                                                flip(element.id);
                                                guesses++;
                                                guessesSpan.innerHTML = guesses;
                                                document.getElementById("game").style.pointerEvents = "none";
                                                setTimeout(function() {
                                                    console.log(cardClicked.innerHTML);
                                                    console.log(element.innerHTML);
                                                    if (cardClicked.innerHTML !== elementDiv.innerHTML) {
                                                        flip(element.id);
                                                        flip(cardClicked.id.slice(0,2));
                                                    } else {
                                                        checkWin(board);
                                                    }
                                                    document.getElementById("game").style.pointerEvents = "auto";
                                                    cardClicked = null;
                                                }, 1000);
                                            }
                                            });
                cell.appendChild(symbolDiv);
            }
        }
    }
    console.log(board);
    document.getElementById("game").appendChild(board);
    console.log("stuff changed");
}

function flip(id) {
    document.getElementById(id).classList.toggle("cardDown");
    document.getElementById(id + "symbol").classList.toggle("cardDown");
    document.getElementById(id + "symbol").classList.toggle("cardUp");
}
    
function shuffleArray(array) {
    var newArray = [];
    while (array[0]) {
        var index = Math.floor(Math.random()*array.length);
        newArray.push(array.splice(index,1)[0]);
    }
    return newArray;
}

function checkWin(board) {
    var won = 1;
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var id = i.toString() + j.toString();
            if (document.getElementAtId(id).classList.contains("cardDown")) {
                won = 0;
            }
        }
    }
    if (won) {
        var game = document.getElementById("game");
        while (game.firstChild) {
            game.removeChild(game.firstChild);
        }
        game.innerHTML += "Thanks for playing!";
    }
}