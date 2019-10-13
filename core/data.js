$players = [];
$provinces = [];

$player = null;

function generateWorld() {
  for (let p = 0;p < TOTAL_CIVS;p++) {
    let civ = new Civilization();
    civ.inventory.stockpile.gold = 1;
    $players.push(civ);
  }
  for (let i = 0;i < TOTAL_PROVINCES;i++) {
    let prov = new Province();
    $provinces.push(prov);

    let civ = $players[(i / 2).floor()];
    prov.owner = civ.id;
    
    let army = new Army();
    army.men = 1000;
    army.grain = army.requiredGrain;
    army.salt = army.requiredSalt;
    
    army.iron = (army.maxIron * Math.random()).round(2);
    army.horses = (army.maxHorses * Math.random()).round(2);
    
    civ.armies.push(army);
  }

  $player = $players.sample();
  $player.setAI = false;
}
