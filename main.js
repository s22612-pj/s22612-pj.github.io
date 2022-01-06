let name = "Gracz";
var gameWithAI;

window.onload = () => {

    let chatField = document.getElementById('messages-field');
    let messageField = document.getElementById('message-field');

    let sendMessageButton = document.getElementById('send-message-button');
    sendMessageButton.addEventListener('click', () => {

        let newMessage = document.createElement('div');

        let username = document.createElement('h6');
        username.innerHTML = name + " pisze:";
        username.classList.add('username');

        let text = document.createElement('p');
        text.innerHTML = messageField.value;
        text.classList.add('message');

        let hr = document.createElement('hr');
        hr.classList.add('hr');

        newMessage.appendChild(username);
        newMessage.appendChild(text);
        newMessage.appendChild(hr);

        chatField.appendChild(newMessage);

        messageField.value = "";

    });

    let gameTypeSelect = document.getElementById('game-type-select');
    let startGameButton = document.getElementById('start-game-button');
    startGameButton.addEventListener('click', () => {
        gameWithAI = gameTypeSelect.value === "0";
        startGame();
    });

}


var origBoard;
var first = true;
const firstPlayer = 'X';
const secondPlayer = '0';
const winCombos = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [6,4,2]
];

const cells = document.querySelectorAll('.cell');


function startGame(){
    document.querySelector(".endgame").style.display = "none";
    origBoard = Array.from(Array(9).keys());
    for(var i = 0; i < cells.length; i++){
        cells[i].innerHTML = '';
        cells[i].style.removeProperty('background-color');
        cells[i].addEventListener('click', turnClick, false);
    }
}

function turnClick(cell){
    if(typeof origBoard[cell.target.id] == 'number'){
        if(gameWithAI) {
            turn(cell.target.id, firstPlayer);
            turn(bestSpot(), secondPlayer);
        }else{
            if(first){
                turn(cell.target.id, firstPlayer);
            }else{
                turn(cell.target.id, secondPlayer);
            }
        }
    }
}

function turn(cellId, player){
    first = !first;
    origBoard[cellId] = player;
    document.getElementById(cellId).innerHTML = player;
    let gameWon = checkWin(origBoard, player);
    if(gameWon){
        gameOver(gameWon);
    }else{
        checkTie();
    }
}

function declareWinner(who){
    document.querySelector(".endgame").style.display = "flex";
    document.querySelector(".endgame .text").innerHTML = who;
}

function emptyCells(){
    return origBoard.filter(c => typeof c == 'number');
}

function bestSpot(){
    return minimax(origBoard, secondPlayer).index;
}

function minimax(newBoard, player){
    var availSpots = emptyCells(newBoard);

    if(checkWin(newBoard, player)){
        return {score: -10};
    }else if(checkWin(newBoard, secondPlayer)){ 
        return {score: 10};
    }else if(availSpots.length === 0){
        return {score:0};
    }

    var moves = [];
    for(var i = 0; i < availSpots.length; i++){
        var move = {};
        move.index = newBoard[availSpots[i]];
        newBoard[availSpots[i]] = player;

        if(player === secondPlayer){
            var result = minimax(newBoard, firstPlayer);
            move.score = result.score;
        }else{
            var result = minimax(newBoard, secondPlayer);
            move.score = result.score;
        }

        newBoard[availSpots[i]] = move.index;
        moves.push(move);
    }

    var bestMove;
    if(player === secondPlayer){
        var bestScore = -10000;
        for(var i = 0; i < moves.length; i++){
            if(moves[i].score > bestScore){
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }else{
        var bestScore = 10000;
        for(var i = 0; i < moves.length; i++){
            if(moves[i].score < bestScore){
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

function checkTie(){
    if(emptyCells().length === 0){
        for(var i = 0; i < cells.length; i++){
            cells[i].style.backgroundColor = "green";
            cells[i].removeEventListener('click', turnClick, false);
        }
        declareWinner("Remis");
        return true;
    }

    return false;
}

function checkWin(board, player){
    let plays = board.reduce((a, e, i) => (e === player) ? a.concat(i) : a, []);
    let gameWon = null;
    for(let [index, win] of winCombos.entries()){
        if(win.every(elem => plays.indexOf(elem) > -1)){
            gameWon = {index: index, player:player};
            break;
        }
    }
    return gameWon;
}

function gameOver(gameWon){
    for(var i = 0; i < cells.length; i++){
        cells[i].removeEventListener('click', turnClick, false);
    }

    if(gameWithAI) {
        for(let index of winCombos[gameWon.index]){
            document.getElementById(index).style.backgroundColor = gameWon.player === firstPlayer ? "blue" : "red";
        }
        declareWinner(gameWon.player === firstPlayer ? "Wygrałeś!" : "Przegrana :(");
    }else{
        for(let index of winCombos[gameWon.index]){
            document.getElementById(index).style.backgroundColor = "blue";
        }
        declareWinner(gameWon.player === firstPlayer ? "Krzyżyk wygrywa!" : "Kółko wygrywa!");
    }
}