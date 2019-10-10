$_turnNumber = 0;
$_currentIndex = 0;

$_currentPlayer = null;

$_roundOrder = [];
$_roundIndex = 0;

function endRound() {
  Civilization.calculateCivStatsAndConsumption();
}

function endTurn() {
  if ($_currentPlayer) $_currentPlayer.sales.reset();
  if (++$_roundIndex >= $_roundOrder.length) {
    $_turnNumber++;
    $_roundIndex = 0;

    $_roundOrder = $players.map(x => x.id).sort(() => Math.random() - 0.5);

    endRound();
  }
  $_currentIndex = $_roundOrder[$_roundIndex];
  $_currentPlayer = $players[$_currentIndex];

  if ($_currentPlayer.setAI) {
    ai_think($_currentPlayer);
    setTimeout(endTurn, 0);
  } else {
    initUI();
    if (PLAYER_SET_AI) {
      alert = ()=>{};
      $_currentPlayer.setAI = true;
      ai_think($_currentPlayer);
      $_currentPlayer.setAI = false;
      setTimeout(endTurn, 100);
    }
  }
}

$(function () {
  generateWorld();
  // $_currentIndex = $players.length;
  endTurn();
});
