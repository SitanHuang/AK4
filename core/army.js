class Army {
  constructor (civ) {
    this.name = 'Unit #' + numeral(Math.random() * 1000).format('000');
    this.defaultName = this.name;
    this.id = Math.random().toString(32).substr(2, 10);
    
    this.men = 0;
    
    this.grain = 0;
    this.salt = 0;
    
    this.iron = 0;
    this.horses = 0;
  }
  
  maxRes(res) {
    switch (res) {
      case 'horses':
        return this.maxHorses;
      case 'iron':
        return this.maxIron;
      case 'grain':
        return this.requiredGrain;
      case 'salt':
        return this.requiredSalt;
    }
  }
  
  equip(civ, res, num) {
    let maxNum = civ.inventory.stockpile[res];
    if (num > maxNum) return `Insufficient stocks.(${maxNum} max)`;
    if (!(num >= 0)) return 'NaN or <= 0. ' + gold;
    
    num = num.max(this.maxRes(res) - this[res]).round(2);
    
    civ.inventory.stockpile[res] = (civ.inventory.stockpile[res] - num).min(0).round(2);
    civ.inventory.demand[res] += num;
    this[res] = (this[res] + num).round(2);

    return 'ok';
  }
  
  get grainConsumption() {
    return (this.requiredGrain * FOOD_CONSUMPTION_PER_ROUND).round(2);
  }
  
  get saltConsumption() {
    return (this.requiredSalt * FOOD_CONSUMPTION_PER_ROUND).round(2);
  }
  
  consume(civ) {
    let grainConsumption = this.grainConsumption;
    let saltConsumption = this.saltConsumption;
    
    let maxGrain = (civ.inventory.stockpile.grain - civ.reserveTarget.grain).min(0).round(2);
    let maxSalt = (civ.inventory.stockpile.salt - civ.reserveTarget.salt).min(0).round(2);
    
    let usedGrain = maxGrain.max(this.requiredGrain - this.grain + grainConsumption);
    let usedSalt = maxSalt.max(this.requiredSalt - this.salt + saltConsumption);
    
    this.grain = (this.grain - grainConsumption + usedGrain).round(2).min(0);
    this.salt = (this.salt - saltConsumption + usedSalt).round(2).min(0);
    
    civ.inventory.demand.grain += usedGrain;
    civ.inventory.demand.salt += usedSalt;
    
    civ.inventory.stockpile.grain -= usedGrain;
    civ.inventory.stockpile.salt -= usedSalt;
  }
  
  get requiredGrain() {
    return (this.men / POPULATION_PER_GRAIN * FOOD_NEED_MULTIPLIER).round(1);
  }
  
  get requiredSalt() {
    return (this.men / POPULATION_PER_SALT * FOOD_NEED_MULTIPLIER).round(1);
  }
  
  get maxIron() {
    return (this.men / MEN_PER_IRON).round(1);
  }
  
  get maxHorses() {
    return (this.men / MEN_PER_HORSES).round(1);
  }
  
  get _foodFactor() {
    return (this.grain / this.requiredGrain + this.salt / this.requiredSalt) / 2;
  }
  
  get defence() {
    let f = this._foodFactor;
    let m = this.men;
    let i = this.iron;
    let d = Math.max(0.2, f) * m * (i / this.maxIron + 0.5);
    return d.round(1);
  }
  
  get defense() { return this.defence; }
  
  get attack() {
    let f = this._foodFactor;
    let m = this.men;
    let i = this.iron;
    let h = this.horses;
    let d = Math.max(0.2, f) * m * (i / this.maxIron + h / this.maxHorses + 0.5);
    return d.round(1);
  }
}