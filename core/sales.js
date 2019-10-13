class Sales {
  constructor (civId) {
    this.civ = civId;
    this.priceList = new ResArray(Infinity);
    this.available = new ResArray(0);

    this._lastSold = new ResArray(0);
    this.reset();
  }

  reset() {
    this._lastSold = new ResArray(0);

    let that = this;
    RESOURCES.forEach(x => {
      if (that.available[x] <= 0)
        that.priceList[x] = Infinity;
    })
  }

  sell(civ, res, gold) {
    if (DISABLE_TRADES) return 'Trade disabled.';
    let myCiv = $players[this.civ];

    let maxGold = civ.inventory.stockpile.gold;
    if (gold > maxGold) return 'Insufficient funds.';
    if (!(gold >= 0)) return 'NaN or <= 0. ' + gold;

    let pcs = gold / this.priceList[res];
    if (pcs > this.available[res]) return 'Insufficient stocks.';

    this.available[res] = (this.available[res] - pcs).min(0).round(2);
    this._lastSold[res] += pcs;

    civ.inventory.stockpile[res] = (civ.inventory.stockpile[res] + pcs).min(0).round(2);
    myCiv.inventory.stockpile[res] = (myCiv.inventory.stockpile[res] - pcs).min(0).round(2);

    civ.inventory.supply[res] = (civ.inventory.supply[res] + pcs).min(0).round(2);
    myCiv.inventory.demand[res] = (myCiv.inventory.demand[res] + pcs).min(0).round(2);

    civ.inventory.stockpile.gold = (civ.inventory.stockpile.gold - gold).min(0).round(2);
    myCiv.inventory.stockpile.gold = (myCiv.inventory.stockpile.gold + gold).round(2);

    return `Bought ${pcs.round(1)}${res} for ${gold.round(1)} total.`;
  }

  calcMaxGold(res) {
    return Math.floor(this.available[res] * this.priceList[res] * 100) / 100.0;
  }
}
