class Province {
  constructor() {
    this.id = $provinces.length;
    this.name = `P${this.id}`;

    this.owner = -1;

    this.resources = new ResArray(0);
    this.demand = new ResArray(0);
    this._setUpResources();

    this.population = ((this.resources.grain * POPULATION_PER_GRAIN + this.resources
      .salt * POPULATION_PER_SALT) / 2).round();
    this.minority = 0;
    this._growthRate = 1;

    this.development = 1;

    this.happiness = (0.5 + Math.random() * 0.5).round(2);
  }

  get neighbors() {
    let list = [];
    if ($provinces[this.id - 1])
      list.push($provinces[this.id - 1]);
    if ($provinces[this.id + 1])
      list.push($provinces[this.id + 1]);
    return list;
  }

  get immigration() {
    return $players[this.owner].allowImmigration;
  }
  get moving() {
    return $players[this.owner].allowMoving;
  }

  resetStats() {
    this.demand = new ResArray(0);
  }

  get developmentBuff() {
    return Math.sqrt(this.development) / 100 + (1-1/100);
  }

  movePop() {
    let that = this;

    this.neighbors.forEach(prov => {
      // if (prov._growthRate <= 1) return;
      if (prov.owner == that.owner && prov.moving) {
        let change = prov._growthRate * prov.population / 20;
        prov.population = (prov.population - change).round();
        that.population = (that.population + change).round();

        if (that.minority > prov.minority) {
          change = prov._growthRate * prov.minority / 20;
          prov.minority = (prov.minority - change).round();
          that.minority = (that.minority + change).round();
        }
      } else if (prov.immigration) {
        let change = prov._growthRate * prov.population / 40;
        prov.population = (prov.population - change).round();
        that.minority = (that.minority + change).round();

        change = prov._growthRate * prov.minority / 40;
        prov.minority = (prov.minority - change).round();
        that.population = (that.population + change).round();
      }
    });
  }

  distributeResources(civ) {
    let totalPop = this.population + this.minority;
    let percShare = totalPop / civ._totalPopulation;

    let maxGrainSupply = (this.resources.grain / civ.inventory.supply.grain + percShare) / 2 * (civ._oldStockPile.grain - civ.reserveTarget.grain).min(0).max(civ.inventory.stockpile.grain);
    let maxSaltSupply = (this.resources.salt / civ.inventory.supply.salt + percShare) / 2 * (civ._oldStockPile.salt - civ.reserveTarget.salt).min(0).max(civ.inventory.stockpile.salt);
    let maxCattlesSupply = (this.resources.cattles / civ.inventory.supply.cattles + percShare) / 2 * (civ._oldStockPile.cattles - civ.reserveTarget.cattles).min(0).max(civ.inventory.stockpile.cattles);

    let maxLumberSupply = percShare * (civ._oldStockPile.lumber - civ.reserveTarget.lumber).min(0);
    let maxIronSupply = percShare * (civ._oldStockPile.iron - civ.reserveTarget.iron).min(0);

    let baseRateGrain = totalPop / POPULATION_PER_GRAIN / this.developmentBuff;
    let baseRateSalt = totalPop / POPULATION_PER_SALT / this.developmentBuff;
    let baseRateCattles = totalPop / POPULATION_PER_CATTLES / this.developmentBuff;

    let usedGrain = Math.min(maxGrainSupply, baseRateGrain * MAXIMUM_CONSUMPTION);
    let usedSalt = Math.min(maxSaltSupply, baseRateSalt * MAXIMUM_CONSUMPTION);
    let usedCattles = Math.min(maxCattlesSupply, baseRateCattles * MAXIMUM_CONSUMPTION);

    let demandGrain = Math.max(Math.min(maxGrainSupply, usedGrain), baseRateGrain * MINIMUM_CONSUMPTION);
    let demandSalt = Math.max(Math.min(maxSaltSupply, usedSalt), baseRateSalt * MINIMUM_CONSUMPTION);
    let demandCattles = Math.max(Math.min(maxCattlesSupply, usedCattles), baseRateCattles * MINIMUM_CONSUMPTION);

    let leftOverGrain = maxGrainSupply - usedGrain;
    let leftOverSalt = maxSaltSupply - usedSalt;
    let leftOverCattles = maxCattlesSupply - usedCattles;

    // civ._oldStockPile.grain += leftOverGrain.min(0) / percShare;
    // civ._oldStockPile.salt += leftOverSalt.min(0) / percShare;
    // civ._oldStockPile.cattles += leftOverCattles.min(0) / percShare;

    this.demand.grain = demandGrain;
    this.demand.salt = demandSalt;
    this.demand.cattles = demandCattles;
    civ.inventory.demand.grain += demandGrain;
    civ.inventory.demand.salt += demandSalt;
    civ.inventory.demand.cattles += demandCattles;

    civ.inventory.stockpile.grain = (civ.inventory.stockpile.grain - usedGrain).min(0);
    civ.inventory.stockpile.salt = (civ.inventory.stockpile.salt - usedSalt).min(0);
    civ.inventory.stockpile.cattles = (civ.inventory.stockpile.cattles - usedCattles).min(0);

    let growthRate = Math.max(MAX_POP_DECAY, (usedGrain / baseRateGrain +
                      usedSalt / baseRateSalt + usedCattles / baseRateCattles) / 3);
    this._growthRate = growthRate;
    this.population *= growthRate;
    this.minority *= growthRate;

    this.population = Math.ceil(this.population);
    this.minority = Math.ceil(this.minority);
    let _deltaPop = this.population + this.minority - totalPop;

    let hapChange = growthRate - 1 + 0.01;
    let popPerc = this.population / totalPop;
    let minorityPerc = this.minority / totalPop;

    if (hapChange < 0)
      hapChange = hapChange * minorityPerc * MINORITY_HAPPINESS_DECREASE_FACTOR + hapChange * popPerc;

    if (this.happiness >= 0.6 && hapChange > 0)
      hapChange /= 10;

    this.happiness = (this.happiness + hapChange).min(0).max(1);

    if (this.happiness > MIN_HAPPINESS_FOR_DEVELOPMENT && maxLumberSupply && maxIronSupply && growthRate > 1) {
      let lUsed = maxLumberSupply.max(LUMBER_PER_DEVELOPMENT);
      let iUsed = maxIronSupply.max(IRON_PER_DEVELOPMENT);
      let lRate = (lUsed / LUMBER_PER_DEVELOPMENT).max(1);
      let iRate = (iUsed / IRON_PER_DEVELOPMENT).max(1);

      let rate = (lRate + iRate) / 2;

      this.development = (this.development + rate).round(2);

      civ.inventory.stockpile.lumber = (civ.inventory.stockpile.lumber - lUsed).min(0);
      civ.inventory.stockpile.iron = (civ.inventory.stockpile.iron - iUsed).min(0);

      civ.inventory.demand.lumber = lUsed;
      civ.inventory.demand.iron = iUsed;
    }
    if (growthRate < 1 || this.happiness < 1) {
      this.development *= Math.min(growthRate, this.happiness).max(1);
      this.development = this.development.round(2).min(1);

      let lUsed = (maxLumberSupply * REGULAR_CONSUMPTION).max(LUMBER_PER_DEVELOPMENT);
      let iUsed = (maxIronSupply * REGULAR_CONSUMPTION).max(IRON_PER_DEVELOPMENT);

      civ.inventory.stockpile.lumber = (civ.inventory.stockpile.lumber - lUsed).min(0);
      civ.inventory.stockpile.iron = (civ.inventory.stockpile.iron - iUsed).min(0);

      civ.inventory.demand.lumber = lUsed;
      civ.inventory.demand.iron = iUsed;
    }

    return _deltaPop;
  }

  // add stockpile & supply
  addToInventory(inv) {
    let resources = this.resources;
    RESOURCES.forEach(x => {
      // +- TURNLY_PRODUCTION_RANGE
      let supply = resources[x] +
        (Math.random() - 0.5) * resources[x] * TURNLY_PRODUCTION_RANGE;
      if (supply < 0) throw 'supply < 0';
      inv.stockpile[x] += supply;
      inv.supply[x] += supply;
    });
  }

  _setUpResources() {
    let that = this;
    RESOURCES.forEach(x => {
      let min = MIN_PRODUCTION;
      let max = MAX_PRODUCTION;
      if (x == 'gold') {
        min = GOLD_PRODUCTION_MIN;
        max = GOLD_PRODUCTION_MAX;
      }

      that.resources[x] = min * (Math.random() + 0.2);

      if (Math.random() <= OCCURENCE[x]) {
        that.resources[x] += Math.random() * OCCURENCE[x] * max;
      }

      that.resources[x] = that.resources[x].round(1);
    });
  }
  static calcGlobalStats() {
    let res = new ResArray(0);
    let supply = new ResArray(undefined);
    let pop = 0;
    let traded = new ResArray(0);
    $provinces.forEach(x => {
      pop += x.population + x.minority;
      RESOURCES.forEach(y => {
        res[y] += x.resources[y];
      });
    });

    $players.forEach(player => {
      RESOURCES.forEach(y => {
        traded[y] += player.sales._lastSold[y].round();
      });
    });

    RESOURCES.forEach(y => {
      res[y] = res[y].round(1);
      if (y == 'grain' || y == 'cattles' || y == 'salt')
        supply[y] = (res[y] * eval(`POPULATION_PER_${y.toUpperCase()}`) / pop).round(2);
    });
    return {
      pop: pop,
      res: res,
      traded: traded,
      supply: supply
    };
  }
}
