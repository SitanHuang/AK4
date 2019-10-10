function prompt_buy(cid, res, num) {
  let civ = $players[cid];
  let player = $_currentPlayer;

  if (player.setAI) {
    // player always approve
    // only notify

    let response = civ.sales.sell(player, res, num);
    if (!civ.setAI && response.indexOf('Bought') == 0)
      alert(`${player.name} ${response}`);
  } else {
    // AI always approve
    // TODO: reject if at war
    num = parseFloat(prompt(`How much of ${res} would you buy?`, civ.sales.calcMaxGold(res).max(player.inventory.stockpile.gold).round(2))).round(2);
    let response = civ.sales.sell(player, res, num);
    alert(response);

    initUI();
  }

}
