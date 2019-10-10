function nav_select(div, func) {
  window._defaultFunc = func;
  window._defaultFuncDiv = div;

  $('.menu > div').removeClass('selected');
  $(div).addClass('selected');

  $('.content > div').hide();
}

function initUI() {
  if (window._defaultFunc) {
    _defaultFunc(_defaultFuncDiv);
  } else
    select_home($('.menu > .home'));
}

function createStatusBar() {
  return `<div class="status">
  <b>${$_currentPlayer.name}</b>
  Turn <b>${$_turnNumber}</b>
  Hap <b style="color:#d77c00">${$_currentPlayer._averageHappiness}</b>
  G <b style="color:#999100">${$_currentPlayer.inventory.stockpile.gold}</b> (${numeral($_currentPlayer.inventory.supply.gold).format('+0.[00]')})
  Pop <span style="color: ${Math.abs($_currentPlayer._populationIncreasePerc) < 0.01 ? '#4b4b4b' : $_currentPlayer._populationIncrease >= 0 ? 'green' : '#a40000'}">${numeral($_currentPlayer._populationIncreasePerc).format('+0.[00]%')}</span>
  </div>`;
}

function createProvinceRow(prov) {
  let html = `
  <div class="province">
  <b>${prov.name}</b>&nbsp;
  ${numeral(prov.population).format('0.[0]a')} - ${numeral(prov.minority).format('0.[0]a')}&nbsp;
  Hap <b style="color:#d77c00">${prov.happiness.round(2)}</b>&nbsp;
  G <b style="color:#999100">${numeral(prov.resources.gold).format('+0.[00]')}</b>
  D <b style="color: blue">${prov.development.round(2)}</b><br>`;
  RESOURCES.forEach(x => {
    if (x == 'gold') return;
    if (prov.resources[x] >= MIN_PRODUCTION) {
      let a = x[0].toUpperCase() + x.replace(/^./, '');
      html += `<div class="res"><b>${a}:</b> +${prov.resources[x].round(1)}</div>`;
    }
  });
  html += `<clear/></div>`;
  return html;
}

function createPriceTable(civ) {
  const color = function (res) {
    if (civ.id == $_currentIndex) {
      if (civ.inventory.price[res] < 1)
        return 'color: green;';
      else
        return 'color: blue;';
    } else if (civ.inventory.price[res] <= $_currentPlayer.inventory.price[res])
      return 'color: green;';
    else
      return 'color: #4b4b4b;';
  }
  let html = `
  <table>
  <tr>
  <th>Gr<td style="text-align: left;${color('grain')}">
  <span style="color: #4b4b4b">${civ.inventory.stockpile.grain.round(1)}<br></span>
  G ${Math.min(civ.inventory.price.grain, civ.sales.priceList.grain)}
  <th>Sa<td style="text-align: left;${color('salt')}">
  <span style="color: #4b4b4b">${civ.inventory.stockpile.salt.round(1)}<br></span>
  G ${Math.min(civ.inventory.price.salt, civ.sales.priceList.salt)}
  <th>Ca<td style="text-align: left;${color('cattles')}">
  <span style="color: #4b4b4b">${civ.inventory.stockpile.cattles.round(1)}<br></span>
  G ${Math.min(civ.inventory.price.cattles, civ.sales.priceList.cattles)}
  <tr>
  <th>Lu<td style="text-align: left;${color('lumber')}">
  <span style="color: #4b4b4b">${civ.inventory.stockpile.lumber.round(1)}<br></span>
  G ${Math.min(civ.inventory.price.lumber, civ.sales.priceList.lumber)}
  <th>Ho<td style="text-align: left;${color('horses')}">
  <span style="color: #4b4b4b">${civ.inventory.stockpile.horses.round(1)}<br></span>
  G ${Math.min(civ.inventory.price.horses, civ.sales.priceList.horses)}
  <th>Ir<td style="text-align: left;${color('iron')}">
  <span style="color: #4b4b4b">${civ.inventory.stockpile.iron.round(1)}<br></span>
  G ${Math.min(civ.inventory.price.iron, civ.sales.priceList.iron)}
  </table>
  `;
  return html;
}

function createConsumptionTable(civ) {
  let grain = (civ.inventory.supply.grain - civ.inventory.demand.grain).round(2);
  let salt = (civ.inventory.supply.salt - civ.inventory.demand.salt).round(2);
  let cattles = (civ.inventory.supply.cattles - civ.inventory.demand.cattles).round(2);
  let lumber = (civ.inventory.supply.lumber - civ.inventory.demand.lumber).round(2);
  let horses = (civ.inventory.supply.horses - civ.inventory.demand.horses).round(2);
  let iron = (civ.inventory.supply.iron - civ.inventory.demand.iron).round(2);

  let html = `
  <table>
  <tr>
  <th>Gr<td style="text-align: left;">
  <small style="color: green">+${civ.inventory.supply.grain.round(1)}</small>,&nbsp;
  <small style="color: #a40000">-${civ.inventory.demand.grain.round(1)}</small><br>
  <b style="color: ${grain < -1 ? '#a40000' : 'green'}">${numeral(grain).format('+0.00')}</b>
  <th>Sa<td style="text-align: left;">
  <small style="color: green">+${civ.inventory.supply.salt.round(1)}</small>,&nbsp;
  <small style="color: #a40000">-${civ.inventory.demand.salt.round(1)}</small><br>
  <b style="color: ${salt < -1 ? '#a40000' : 'green'}">${numeral(salt).format('+0.00')}</b>
  <th>Ca<td style="text-align: left;">
  <small style="color: green">+${civ.inventory.supply.cattles.round(1)}</small>,&nbsp;
  <small style="color: #a40000">-${civ.inventory.demand.cattles.round(1)}</small><br>
  <b style="color: ${cattles < -1 ? '#a40000' : 'green'}">${numeral(cattles).format('+0.00')}</b>
  <tr>
  <th>Lu<td style="text-align: left;">
  <small style="color: green">+${civ.inventory.supply.lumber.round(1)}</small>,&nbsp;
  <small style="color: #a40000">-${civ.inventory.demand.lumber.round(1)}</small><br>
  <b style="color: ${lumber < -1 ? '#a40000' : 'green'}">${numeral(lumber).format('+0.00')}</b>
  <th>Ho<td style="text-align: left;">
  <small style="color: green">+${civ.inventory.supply.horses.round(1)}</small>,&nbsp;
  <small style="color: #a40000">-${civ.inventory.demand.horses.round(1)}</small><br>
  <b style="color: ${horses < -1 ? '#a40000' : 'green'}">${numeral(horses).format('+0.00')}</b>
  <th>Ir<td style="text-align: left;">
  <small style="color: green">+${civ.inventory.supply.iron.round(1)}</small>,&nbsp;
  <small style="color: #a40000">-${civ.inventory.demand.iron.round(1)}</small><br>
  <b style="color: ${iron < -1 ? '#a40000' : 'green'}">${numeral(iron).format('+0.00')}</b>
  </table>
  `;
  return html;
}
