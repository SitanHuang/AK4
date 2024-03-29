function ai_think(civ) {
  ai_train_army(civ);
  ai_think_sales(civ);
  ai_think_gold_budget(civ);
  ai_adjust_reserve(civ);
}

function ai_train_army(civ) {
  let oldReserveTarget = civ.reserveTarget;
  civ.reserveTarget = new ResArray(100);
  
  civ._milNeed = new ResArray(0);
    
  civ.armies.forEach((army, i) => {
    army.name = `${numeral(Math.floor(i / 3 + 1)).format('0o')} Division ${numeral(i % 3 + 1).format('0o')} Regiment`;
    prompt_draft_army(army.id);
    
    RESOURCES.forEach(x => {
      if (x == 'grain' || x == 'salt' || x == 'horses' || x == 'iron') {
        let extra = (civ.inventory.stockpile[x] - civ.reserveTarget[x]).min(0);
        prompt_equip_army(army.id, x, extra);
        
        civ._milNeed[x] += army.maxRes(x) - army[x];
      }
    });
  });
  
  civ.reserveTarget = oldReserveTarget;
  
  if (civ._military < civ._totalPopulation * 0.08) {    
    createArmy();
  } if (civ._military > civ._totalPopulation * 0.11) {
    removeArmy(civ.armies.sort((a, b) => (a.men - b.men))[0].id);
  }
}

function ai_adjust_reserve(civ) {
  RESOURCES.forEach(x => {
    if (x == 'gold') {
      return;
    }
    let supply = civ.inventory.supply[x];
    let stock = civ.inventory.stockpile[x];
    let reserve = civ.reserveTarget[x];
    let demand = civ.inventory.demand[x];
    let diff = (demand - supply);

    if (demand > supply && stock - diff <= reserve) { // slowly bleed out reserve
      reserve = (stock - diff * 0.65).min(100).round(2);
    } else if (demand < supply && stock > reserve * 2 && stock > 100) {
      reserve = (stock / 2).max(demand * 10).min(100).round(2);
    }

    civ.reserveTarget[x] = reserve;
  });
}

function ai_think_gold_budget(civ) {
  let maxBudget = (civ.inventory.stockpile.gold - civ.reserveTarget.gold).min(0);

  if (Math.random() > 0.7) {
    // save 20%
    maxBudget *= 0.8;
  }

  let budgetForNecessaryImport = maxBudget * 0.8;
  let budgetForExtraImport = maxBudget * 0.2;

  let demandList = {};
  let totalDemandPrice = 0;

  RESOURCES.forEach(x => {
    if (x == 'gold') {
      return;
    }
    let supply = civ.inventory.supply[x];
    let demand = civ.inventory.demand[x] * (1 + TURNLY_PRODUCTION_RANGE);
    let need = (demand - supply).min(0);

    if (demand > supply) { // buy in
      let obj = demandList[x] || [];

      civ._neighbors.forEach(n => {
        let neighbor = n.civ;
        if (neighbor.sales.available[x] > 0) {
          let price = neighbor.sales.priceList[x];
          totalDemandPrice += price * need;
          obj.push([neighbor, price]);
        }
      });

      demandList[x] = obj.sort((a, b) => (a[1] - b[1]));
    } else {
      civ._neighbors.forEach(n => {
        let neighbor = n.civ;
        if (budgetForExtraImport > 0 && neighbor.sales.available[x] > 0) {
          let price = neighbor.sales.priceList[x];
          if (price < civ.sales.priceList[x]) {
            let maxGold = budgetForExtraImport * Math.random();
            let gold = neighbor.sales.calcMaxGold(x)
              .max(maxGold).round(2);
            budgetForExtraImport -= gold;
            if (gold <= neighbor.sales.priceList[x]) return;

            prompt_buy(neighbor.id, x, gold);
          }
        }
      });
    }
  });

  Object.getOwnPropertyNames(demandList).forEach(res => {
    let sellerList = demandList[res];
    sellerList.forEach(obj => {
      let seller = obj[0];

      let supply = civ.inventory.supply[res];
      let demand = civ.inventory.demand[res] * (1 + TURNLY_PRODUCTION_RANGE);
      let need = (demand - supply).min(0);

      // if (need <= 0) {
      //   totalDemandPrice -= seller.sales.priceList[res] * need;
      //   return;
      // }

      let gold = seller.sales.calcMaxGold(res)
        .max(seller.sales.priceList[res] * need / totalDemandPrice * budgetForNecessaryImport)
        .max(budgetForNecessaryImport).round(2);
      if (gold <= seller.sales.priceList[res]) return;

      prompt_buy(seller.id, res, gold);
    });
  });
}

function ai_think_sales(civ) {
  RESOURCES.forEach(x => {
    if (x == 'gold') {
      // TODO: cancel this in times of war
      civ.reserveTarget[x] = MAX_TAX_RATE * civ.inventory.supply[x];
      return;
    }
    let supply = civ.inventory.supply[x];
    let demand = civ.inventory.demand[x] * (1 + TURNLY_PRODUCTION_RANGE);
    let stockpile = civ.inventory.stockpile[x];
    let reserve = civ.reserveTarget[x];

    if (stockpile > demand + reserve + civ._milNeed[x]) {
      // determine availability
      // civ.sales.available[x] = Math.min(supply - demand, stockpile - reserve).min(0).round(2);
      civ.sales.available[x] = (stockpile - reserve).min(0).round(2);
      if (civ.sales.priceList[x] == Infinity) {
        // determine base price
        civ.sales.priceList[x] = civ.inventory.price[x].round(2);
      } else {
        // adjust price
        let change = 0;
        // if (civ.sales._lastSold[x] <= 0) { // not sold out
        //   change = civ.sales.priceList[x] * -0.4;
        // } else {
          // sold some or all
          let rate = (civ.sales._lastSold[x] / civ.sales.available[x] - 0.2);
          change = civ.sales.priceList[x] * rate;
        // }
        civ.sales.priceList[x] = (civ.sales.priceList[x] + change).min(0.01).round(2);
      }
    } else {
      // no export
      civ.sales.available[x] = 0;
    }
  });
}
