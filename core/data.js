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
  }

  $player = $players.sample();
  $player.setAI = false;
}
