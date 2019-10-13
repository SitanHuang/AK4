class Civilization {
  constructor() {
    this.id = $players.length;
    this.name = `Z${this.id}`;
    this.setAI = true;

    this.inventory = new Inventory();
    this.armies = [];

    this.gold = INIT_STOCKPILE * MAX_TAX_RATE;

    // === policies ===
    this.reserveTarget = new ResArray(100);
    this.allowImmigration = false;
    this.allowMoving = false;
    this.sales = new Sales(this.id);

    this.goldReserve = 10;

    this.resetStats();

  }

  resetStats() {
    this._totalPopulation = 0;
    this._populationIncrease = 0;
    this._populationIncreasePerc = 0;

    this._military = 0;

    this._provinces = 0;
    this._averageHappiness = 0;

    this._provincesList = [];
    this._neighbors = {};

    this.inventory.resetDemandAndSupply();
  }

  /*
  * 1. add res. supply
  * 2. distribute resources
  * 3. calculate hap.
  * 4. calculate growth
  */
  static calculateCivStatsAndConsumption() {
    $players.forEach(civ => {
      civ.resetStats();
    });

    $provinces.forEach(prov => {
      let civ = $players[prov.owner];
      civ._provinces++;
      civ._totalPopulation += prov.population + prov.minority;
      civ._provincesList.push(prov);

      prov.neighbors.forEach(p => {
        if (p.owner != civ.id)
          civ._neighbors[p.owner] = { prov: p, civ: $players[p.owner] };
      });

      prov.addToInventory(civ.inventory);
      prov.resetStats();
      prov.movePop();
    });


    $players.forEach(civ => {
      civ._neighbors = Object.values(civ._neighbors).sort((a, b) => (a.prov.id - b.prov.id));
      civ._oldStockPile = civ.inventory.stockpile.clone();
      civ.armies.forEach(army => {
        civ._military += army.men.round();
        army.consume(civ);
      });
    });

    $provinces.forEach(prov => {
      let civ = $players[prov.owner];
      let deltaPop = prov.distributeResources(civ);

      civ._populationIncrease += deltaPop;
      civ._averageHappiness += prov.happiness;

      prov.demand.round();
    });

    $players.forEach(civ => {
      civ._averageHappiness = (civ._averageHappiness / civ._provinces).round(2);
      civ._populationIncrease = civ._populationIncrease.round();
      civ._populationIncreasePerc = (civ._populationIncrease / civ._totalPopulation).round(4);

      civ.inventory.calcPrices();
      civ.inventory.round();

      // civ._provincesList = civ._provincesList.sort((a, b) => (b.population - a.population));

      civ.reserveTarget.gold = civ.reserveTarget.gold.max(civ.inventory.supply.gold * MAX_TAX_RATE).round(2);
    });
  }
}
