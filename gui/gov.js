function select_gov(div) {
  nav_select(div, select_gov);

  let player = $_currentPlayer;

  let $div = $('.content > .home').show();
  let html = '';
  html = `${createStatusBar()}
  <div style="padding: 0 1em 1em 1em;">
    ${createPriceTable(player)}<br>
    ${createConsumptionTable(player)}<br>
    Immigration: <select id="immigration"><option value="allow">Allow</option><option value="disallow">Disallow</option></select>&nbsp;
    Moving: <select id="moving"><option value="allow">Allow</option><option value="disallow">Disallow</option></select><br>
    <br><b>Sales</b>
    <button style="float: right" onclick="ai_think_sales($_currentPlayer);initUI()">Auto</button>
    <br><table>`;
  RESOURCES.forEach(x => {
    if (x == 'gold') return;
    let price = player.sales.priceList[x];
    let available = player.sales.available[x];
    html += `
    <tr><th><b class="capitalize">${x}</b>
    <td>$<input value="${price}" style="width: 3em" onclick="this.select();" type="number" step="0.01" min="0" oninput="_changePrice('${x}', this)">
    <input value="${available}" style="width: 4em" onclick="this.select();" type="number" step="0.01" min="0" oninput="_changeAvailable('${x}', this)">
    `;
  });
  html += `</table><br><b>Reserves:</b>
  <button style="float: right" onclick="ai_adjust_reserve($_currentPlayer);initUI()">Auto</button>
  <br><table>`;
  RESOURCES.forEach(x => {
    let reserve = player.reserveTarget[x];
    html += `
    <tr><th><b class="capitalize">${x}</b>
    <td><input value="${reserve}" onclick="this.select();" type="number" step="0.01" min="0" oninput="_changeReserve('${x}', this)">
    `;
  });
  html += '</table>'
  html += `</div>`;

  $div.html(html);

  $div.find('#immigration option[value="' + ($_currentPlayer.allowImmigration ? 'allow' : 'disallow') + '"]').attr('selected', 'selected');
  $div.find('#moving option[value="' + ($_currentPlayer.allowMoving ? 'allow' : 'disallow') + '"]').attr('selected', 'selected');

  let im = $div.find('#immigration')[0];
  im.onchange = () => {
    $_currentPlayer.allowImmigration = im.value == 'allow';
  };
  let mv = $div.find('#moving')[0];
  mv.onchange = () => {
    $_currentPlayer.allowMoving = mv.value == 'allow';
  };

}

function _changeReserve(x, input) {
  let val = parseFloat(input.value).round(2);
  if (val >= 0) {
    $_currentPlayer.reserveTarget[x] = val;
  }
}
function _changePrice(x, input) {
  let val = parseFloat(input.value).round(2);
  if (val >= 0) {
    $_currentPlayer.sales.priceList[x] = val;
  }
}
function _changeAvailable(x, input) {
  let val = parseFloat(input.value).round(2);
  if (val >= 0) {
    $_currentPlayer.sales.available[x] = val;
  }
}
