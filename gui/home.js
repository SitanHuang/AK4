function select_home(div) {
  nav_select(div, select_home);

  let player = $_currentPlayer;

  let $div = $('.content > .home').show();
  let html = '';
  html = `${createStatusBar()}
  <div style="padding: 0 1em 1em 1em;">
    <h3>Stats</h3>
    <table>
    <tr>
    <th width=100000>Population
    <td><code>${numeral(player._totalPopulation).format('0,0')}</code>
    <tr>
    <th>
    <td><code style="color: ${Math.abs(player._populationIncreasePerc) < 0.01 ? '#4b4b4b' : player._populationIncrease >= 0 ? 'green' : '#a40000'};font-size: 0.9em">${numeral(player._populationIncrease).format('+0,0')} (${numeral(player._populationIncreasePerc).format('+0.00%')})</code>
    <tr>
    <th>Armed personel
    <td><code>${numeral(player._military).format('0,0')}</code>
    <tr>
    <th>Provinces
    <td><code>${player._provinces}</code>
    </table>
    <br>
  </div>
  `;

  player._provincesList.forEach(prov => {
    html += createProvinceRow(prov);
  });

  $div.html(html);
}
