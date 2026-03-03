// ===== マップ =====
const areas = ["瀬戸内海","阿波沖","新潟沖","宮古湾","函館"];
let unlockedIndex = 0; // 解放状況
let currentArea = null;

let playerFleet = [];
let enemyFleet = [];

let turn = "player"; // player / enemy
let battleActive = false;


// ===== 味方（テスト用3隻）=====
playerFleet = [
  {
    id: 1,
    name: "春日丸",
    hp: 48,
    maxHp: 48,
    attack: 11,
    rarity: "SSR",
    image: "images/kasugamaru.png" // ★画像挿入部
  },
  {
    id: 2,
    name: "李白里丸",
    hp: 55,
    maxHp: 55,
    attack: 12,
    rarity: "SSR",
    image: "images/rihakurimaru.png" // ★画像挿入部
  },
  {
    id: 3,
    name: "電流丸",
    hp: 40,
    maxHp: 40,
    attack: 9,
    rarity: "SR",
    image: "images/denryumaru.png" // ★画像挿入部
  }
];


// ===== 幕府NPC =====
const enemyMap = { /* 前回と同じ内容 */ };


// ===== マップ表示 =====
function renderMap() {
  let html = "";
  areas.forEach((area, index) => {
    if (index <= unlockedIndex) {
      html += `<button onclick="startBattle('${area}')">${area}</button>`;
    } else {
      html += `<button disabled>？？？</button>`;
    }
  });
  document.getElementById("map").innerHTML = html;
}


// ===== 戦闘開始 =====
function startBattle(area) {
  currentArea = area;
  enemyFleet = JSON.parse(JSON.stringify(enemyMap[area]));
  turn = "player";
  battleActive = true;
  renderAll();
}


// ===== 表示 =====
function renderFleet(fleet, elementId) {
  let html = "";
  fleet.forEach(ship => {
    let hpPercent = (ship.hp / ship.maxHp) * 100;

    html += `
      <div class="shipCard">
        <img src="${ship.image}" class="shipImage">
        <div>${ship.name}</div>
        <div class="hpBar" style="width:${hpPercent}%"></div>
        <div>${ship.hp} / ${ship.maxHp}</div>
      </div>
    `;
  });
  document.getElementById(elementId).innerHTML = html;
}

function renderAll() {
  renderFleet(playerFleet, "playerFleet");
  renderFleet(enemyFleet, "enemyFleet");
}


// ===== プレイヤーターン =====
function playerAttack() {
  if (!battleActive || turn !== "player") return;

  playerFleet.forEach(ship => {
    if (ship.hp <= 0) return;

    let target = enemyFleet.find(e => e.hp > 0);
    if (!target) return;

    target.hp -= ship.attack;
    if (target.hp < 0) target.hp = 0;
  });

  checkBattleEnd();
  turn = "enemy";
  setTimeout(enemyTurn, 1000);
}


// ===== 敵ターン =====
function enemyTurn() {
  enemyFleet.forEach(ship => {
    if (ship.hp <= 0) return;

    let target = playerFleet.find(p => p.hp > 0);
    if (!target) return;

    target.hp -= ship.attack;
    if (target.hp < 0) target.hp = 0;
  });

  checkBattleEnd();
  turn = "player";
  renderAll();
}


// ===== 勝敗判定 =====
function checkBattleEnd() {
  let playerAlive = playerFleet.some(s => s.hp > 0);
  let enemyAlive = enemyFleet.some(s => s.hp > 0);

  if (!enemyAlive) {
    battleActive = false;
    alert(currentArea + " 制圧成功！");

    if (unlockedIndex < areas.length - 1) {
      unlockedIndex++;
    } else {
      alert("🎉 全海域制覇！ゲームクリア！");
    }

    renderMap();
  }

  if (!playerAlive) {
    battleActive = false;
    alert("艦隊壊滅…ゲームオーバー");
  }

  renderAll();
}


renderMap();
renderAll();
