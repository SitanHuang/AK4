function select_trade(div) {
  nav_select(div, select_trade);

  let player = $_currentPlayer;

  let $div = $('.content > .home').show();
  let html = '';
  html = `
  ${createStatusBar()}
  <div style="padding: 0 1em 1em 1em;">
    ${createPriceTable(player)}
    ${createConsumptionTable(player)}<br></div>`;

  player._neighbors.forEach(neighbor => {
    html += createNeighborRow(neighbor);
  });

  $div.html(html);
}

function createNeighborRow(neighbor) {
  const color = function (res) {
    if (civ.sales.priceList[res] <= $_currentPlayer.inventory.price[res])
      return 'color: green;';
    else
      return 'color: #ab0000;';
  }
  let civ = neighbor.civ;
  let prov = neighbor.prov;
  let html = `
  <div class="province">
  <b>${civ.name}</b> at ${prov.name}&nbsp;
  ${numeral(civ._totalPopulation).format('0.[0]a')}&nbsp;
  Hap <b style="color:#d77c00">${civ._averageHappiness.round(2)}</b><br>&nbsp;`;
  RESOURCES.forEach(x => {
    if (x == 'gold') return;

    let avail = civ.sales.available[x];
    let price = civ.sales.priceList[x];
    if (avail > 0) {
      html += `<div class="res capitalize" onclick="prompt_buy(${civ.id}, '${x}')">
      <b>${x}:</b>
      <span style="float: right; margin-right: 2em;${color(x)}">$${numeral(price).format('0.00')}</span><br>
      <span style="float: right; margin-right: 2em;">${numeral(avail).format('0.[00]')}</span>
      </div>`;
    }
  });
  html += `<clear/></div>`;
  return html;
}
