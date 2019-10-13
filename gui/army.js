function select_army(div) {
  nav_select(div, select_army);

  let player = $_currentPlayer;

  let $div = $('.content > .home').show();
  let html = '';
  html = `${createStatusBar()}
  <div style="padding: 0.5em 0.5em;">
    <button onclick="createArmy()">Create</button>
    <button onclick="$_currentPlayer.setAI=true;ai_train_army($_currentPlayer);$_currentPlayer.seAI=false;initUI()">Auto</button>
  </div>`;
  
  player.armies.forEach(army => {
    html += _createArmyRow(army);
  });
  
  html += ``;

  $div.html(html);
}

function _createArmyRow(army) {
  let html = `<div class="province" oncontextmenu="removeArmy('${army.id}')">
  <b onclick="renameArmy('${army.id}')">${army.name}</b>
  <span onclick="prompt_draft_army('${army.id}');">${army.men} Men &nbsp;</span>
  D <b style="color:blue">${numeral(army.defence).format('0.0a')}</b>&nbsp;
  A <b style="color:#ab0000">${numeral(army.attack).format('0.0a')}</b>&nbsp;
  <br><br><div class="res capitalize" onclick="prompt_equip_army('${army.id}', 'grain')">
  <b>Gr:</b>
  <span style="float: right; margin-right: 2em;">${army.grain.round(2)} / ${army.requiredGrain.round(2)}</span><br>
  <span style="float: right; margin-right: 2em;color: #ab0000">- ${army.grainConsumption}</span><br>
  </div><div class="res capitalize" onclick="prompt_equip_army('${army.id}', 'salt')">
  <b>Sa:</b>
  <span style="float: right; margin-right: 2em;">${army.salt.round(2)} / ${army.requiredSalt.round(2)}</span><br>
  <span style="float: right; margin-right: 2em;color: #ab0000">- ${army.saltConsumption}</span><br>
  </div><div class="res capitalize" onclick="prompt_equip_army('${army.id}', 'iron')">
  <b>Ir:</b>
  <span style="float: right; margin-right: 2em;">${army.iron.round(2)} / ${army.maxIron.round(2)}</span><br>
  </div><div class="res capitalize" onclick="prompt_equip_army('${army.id}', 'horses')">
  <b>Hr:</b>
  <span style="float: right; margin-right: 2em;">${army.horses.round(2)} / ${army.maxHorses.round(2)}</span>
  <br></div><clear></clear></div>`;
  return html;
}