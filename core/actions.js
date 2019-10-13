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

function prompt_equip_army(army, res, num) {
  let player = $_currentPlayer;
  army = player.armies.filter(x => x.id == (army.id || army))[0];
  
  let max = player.inventory.stockpile[res].max(army.maxRes(res) - army[res]).round(2);
  num = num || max;
  
  if (!player.setAI) {
    num = parseFloat(prompt(`How many of ${res}?`, '' + max));
    
    if (!(num >= 0)) return 'NaN';
  }
  
  num = num.max(max);
  
  let response = army.equip(player, res, num);
  if (!player.setAI && response.indexOf('ok') == 0) {
    alert(response);
    initUI();
  }
  return response;
}

function prompt_draft_army(army, num) {
  let player = $_currentPlayer;
  army = player.armies.filter(x => x.id == (army.id || army))[0];
  
  let max = Math.floor((MAX_MEN_PER_ARMY - army.men).max(player._totalPopulation * 0.1 - player._military));
  num = num || max;
  
  if (!player.setAI) {
    num = parseInt(prompt(`How many men?`, '' + max));
    
    if (!(num >= 0)) return 'NaN';
  }
  
  num = num.max(max).min(0);
  
  army.men += num.round();
  
  player._provincesList.forEach(x => {
    let total = (x.population + x.minority);
    let perc = total / player._totalPopulation;
    let change = perc * num;
    
    x.population = (x.population - (x.population / total) * change).min(1).round();
    x.minority = (x.minority - (x.minority / total) * change).min(1).round();
    
    x.happiness = (x.happiness - (change / total)).round(2);
  });
  
  if (!player.setAI) initUI();
  
  return 'ok';
}

function renameArmy(army, name) {
  let player = $_currentPlayer;
  army = player.armies.filter(x => x.id == (army.id || army))[0];
  
  if (!player.setAI) {
    name = prompt('What name?', army.name);
    if (!name || !name.trim || !(name = name.trim()))
      name = army.defaultName;
  }
  
  army.name = name;
  
  if (!player.setAI) initUI();
}

function removeArmy(army) {
  let player = $_currentPlayer;
  for (let i = 0;i < player.armies.length;i++) {
    if (player.armies[i].id == (army.id || army)) {
      player.inventory.stockpile.iron += player.armies[i].iron;
      player.inventory.stockpile.horses += player.armies[i].horses;
      
      player.inventory.supply.iron += player.armies[i].iron;
      player.inventory.supply.horses += player.armies[i].horses;
      
      player.armies.splice(i, 1);
      
      initUI();
      return;
    }
  }
}

function createArmy() {
  let player = $_currentPlayer;
  
  for (let i = 0;i < player.armies.length;i++) {
    if (player.armies[i].defence == 0 || player.armies[i].attack == 0 || player.armies[i].men == 0) {
      if (!player.setAI)
        alert("There's already a new army.");
      return false;
    }
  }
  
  if (player._military > player._totalPopulation * 0.1) {
    if (!player.setAI)
      alert("Army size reached maximum limit. Abort.");
    return false;
  }
  
  let army = new Army();
  player.armies.push(army);
  
  if (!player.setAI)
    initUI();
}