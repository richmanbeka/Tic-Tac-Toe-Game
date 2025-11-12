const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const startBtn = document.getElementById("startBtn");
const backBtn = document.getElementById("backBtn");
const player1Input = document.getElementById("player1");
const player2Input = document.getElementById("player2");
const player2Group = document.getElementById("player2Group");
const modeSelect = document.getElementById("modeSelect");
const difficultyGroup = document.getElementById("difficultyGroup");
const difficultySelect = document.getElementById("difficultySelect");
const cells = document.querySelectorAll(".cell");
const currentPlayerDisplay = document.getElementById("CurrentPlayer");
const gameStatus = document.getElementById("GameStatus");
const resetBtn = document.getElementById("resetBtn");
const resetScoreBtn = document.getElementById("resetScoreBtn");
const scoreX = document.getElementById("ScoreX");
const scoreO = document.getElementById("scoreO");
const scoreTie = document.getElementById("scoreTie");
const labelX = document.getElementById("labelX");
const labelO = document.getElementById("labelO");

const clickSound = new Audio("assets/click.mp3");
const winSound = new Audio("assets/win.mp3");
const tieSound = new Audio("assets/tie.mp3");
const loseSound = new Audio("assets/lose.mp3");

let board = Array(9).fill("");
let currentPlayer = "X";
let playerXName = "Player X";
let playerOName = "Player O";
let mode = "PvP";
let difficulty = "medium";
let gameOver = false;
let scores = { X:0, O:0, T:0 };

const winningCombos = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

modeSelect.addEventListener("change", () => {
  player2Group.style.display = modeSelect.value === "PvC" ? "none" : "block";
  difficultyGroup.style.display = modeSelect.value === "PvC" ? "block" : "none";
});

startBtn.addEventListener("click", () => {
  playerXName = player1Input.value || "Player X";
  playerOName = modeSelect.value === "PvC" ? "Computer" : (player2Input.value || "Player O");
  mode = modeSelect.value;
  difficulty = difficultySelect.value;
  labelX.textContent = playerXName;
  labelO.textContent = playerOName;
  startScreen.style.display = "none";
  gameScreen.style.display = "block";
  resetBoard();
});

backBtn.addEventListener("click", () => {
  gameScreen.style.display = "none";
  startScreen.style.display = "block";
  resetBoard();
});

cells.forEach(cell => cell.addEventListener("click", () => handleClick(cell)));

function handleClick(cell) {
  const index = cell.dataset.index;
  if(board[index] || gameOver) return;

  clickSound.play();
  board[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add("taken", currentPlayer.toLowerCase());

  if(checkWinner()) return endGame(currentPlayer);
  if(board.every(c => c !== "")) return endGame("T");

  currentPlayer = currentPlayer==="X"?"O":"X";
  updateTurnText();

  if(mode==="PvC" && currentPlayer==="O" && !gameOver){
    setTimeout(aiMove, 300);
  }
}

  function aiMove() {
  let best;
  const avail = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);

  if (difficulty === "easy") {
    best = avail[Math.floor(Math.random() * avail.length)];
  } 
  else if (difficulty === "medium") {
    best = findWinningMove("O") || findWinningMove("X") || avail[Math.floor(Math.random() * avail.length)];
  } 
  else {
    best = minimax(board, "O").index;
  }

  board[best] = "O";
  const cell = cells[best];
  cell.textContent = "O";
  cell.classList.add("taken", "o");


  if (checkWinner()) return endGame("O");
  if (board.every(c => c !== "")) return endGame("T");

  currentPlayer = "X";
  updateTurnText();
}

function findWinningMove(player) {
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = player;
      if (checkWinner()) { 
        board[i] = ""; 
        return i; 
      }
      board[i] = "";
    }
  }
  return null;
}

function minimax(newBoard, player) {
  const avail = newBoard.map((v, i) => v === "" ? i : null).filter(v => v !== null);

  if (checkWinnerFor("X", newBoard)) return { score: -10 };
  if (checkWinnerFor("O", newBoard)) return { score: 10 };
  if (!avail.length) return { score: 0 };

  const moves = [];
  for (const i of avail) {
    const move = {};
    move.index = i;
    newBoard[i] = player;

    const result = minimax(newBoard, player === "O" ? "X" : "O");
    move.score = result.score;

    newBoard[i] = "";
    moves.push(move);
  }

  if (player === "O") {
    return moves.reduce((best, m) => m.score > best.score ? m : best);
  } else {
    return moves.reduce((best, m) => m.score < best.score ? m : best);
  }
}

function checkWinner(){
  return winningCombos.some(([a,b,c])=>board[a] && board[a]===board[b] && board[a]===board[c]);
}

function checkWinnerFor(p,b){
  return winningCombos.some(([a,b1,c])=>b[a]===p && b[b1]===p && b[c]===p);
}

function endGame(result){
  gameOver=true;
  if(result==="T"){
    gameStatus.textContent="It's a Tie! ⚖️";
    tieSound.play();
    scores.T++;
    scoreTie.textContent=scores.T;
  } else {
    const winnerName = result==="X"?playerXName:playerOName;
    gameStatus.textContent = result==="X"?`🎉 ${winnerName} Wins! 🎉`:`😢 ${winnerName} Wins! 😢`;
    if(result==="X") winSound.play();
    else loseSound.play();
    scores[result]++;
    if(result==="X") scoreX.textContent = scores.X;
    else scoreO.textContent = scores.O;
  }
}

function updateTurnText(){
  const name = currentPlayer==="X"?playerXName:playerOName;
  currentPlayerDisplay.textContent=`${name}'s turn`;
}

function resetBoard(){
  board.fill("");
  gameOver=false;
  currentPlayer="X";
  cells.forEach(c=>{
    c.textContent="";
    c.className="cell";
  });
  gameStatus.textContent="";
  updateTurnText();
}


resetBtn.addEventListener("click",()=>resetBoard());
resetScoreBtn.addEventListener("click",()=>{
  scores={X:0,O:0,T:0};
  scoreX.textContent=0;
  scoreO.textContent=0;
  scoreTie.textContent=0;
});
