RESOURCES = ['salt', 'grain', 'cattles', 'lumber', 'horses', 'iron', 'gold'];

class ResArray {
  constructor(init) {
    // for domestic, battles, and development
    this.salt = init || 0;
    this.grain = init || 0;
    this.cattles = init || 0;
    this.lumber = init || 0;

    // for battles only
    this.horses = init || 0;
    this.iron = init || 0;

    // THE only currency
    this.gold = init || 0;
  }

  sum() {
    // faster than iteration
    return this.salt + this.grain + this.cattles + this.lumber + this.horses + this.iron + this.gold;
  }

  round() {
    let that = this;
    RESOURCES.forEach(x => that[x] = that[x].round(2));
  }

  clone() {
    let n = new ResArray();
    n.salt = this.salt;
    n.grain = this.grain;
    n.cattles = this.cattles;
    n.lumber = this.lumber;

    // for battles only
    n.horses = this.horses;
    n.iron = this.iron;

    // THE only currency
    n.gold = this.gold;

    return n;
  }
}

class Inventory {
  constructor() {
    this.stockpile = new ResArray(INIT_STOCKPILE);
    this.resetDemandAndSupply();
  }

  round() {
    this.demand.round();
    this.supply.round();
    this.price.round();
    this.stockpile.round();
  }

  resetDemandAndSupply() {
    this.demand = new ResArray(0);
    this.supply = new ResArray(0);

    this.price = new ResArray(0);
  }

  calcPrices() {
    let that = this;
    RESOURCES.forEach(x => {
      that.price[x] = that.calcLocalPrice(x);
    });
  }

  calcTotalSupply() {
    return this.supply.sum();
  }

  calcLocalPrice(name) {
    if (name == 'gold') return 1;
    // let stock = this.stockpile[name];
    let stock = this.supply[name];
    if (stock <= 0) return Infinity;
    // return this.stockpile.gold * this.calcTotalSupply() / stock;
    return this.supply.gold * this.calcTotalSupply() / stock;
  }
}
