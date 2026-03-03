// ===== マップ =====
const areas = ["瀬戸内海","阿波沖","新潟沖","宮古湾","函館"];
let unlockedIndex = 0;
let currentArea = null;
let battleActive = false;
let turn = "player";

let playerFleet = [];
let enemyFleet = [];

let ownedShips = [];
let selectedFleet = [];
let gachaUsed = false;

// ===== 全艦データ（画像挿入部あり）=====
const allShips = [
 {name:"翔凰丸", hp:35, attack:7, rarity:"N", image:"images/shouhoumaru.png"}, 
 {name:"乾行", hp:42, attack:9, rarity:"SR", image:"images/kenkou.png"},
 {name:"昇平丸", hp:30, attack:6, rarity:"N", image:"images/shouheimaru.png"},
 {name:"春日丸", hp:48, attack:11, rarity:"SSR", image:"images/kasugamaru.png"},
 {name:"雲行丸", hp:38, attack:8, rarity:"R", image:"images/kumoyukimaru.png"},
 {name:"李白里丸", hp:55, attack:12, rarity:"SSR", image:"images/rihakurimaru.png"},
 {name:"万年丸", hp:55, attack:12, rarity:"SSR", image:"images/mannenmaru.png"}
];

// ===== 幕府敵データ（画像挿入部）=====
const enemyMap = {
 "瀬戸内海":[{name:"千代田丸",hp:45,maxHp:45,attack:9,image:"images/chiyodamaru.png"}],
 "阿波沖":[{name:"開陽丸",hp:55,maxHp:55,attack:11,image:"images/kaiyoumaru.png"}],
 "函館":[{name:"東艦",hp:65,maxHp:65,attack:13,image:"images/azumakan.png"}]
};

// ===== ガチャ =====
function drawGacha() {
 if (gachaUsed) return alert("10連は初回のみ");

 let resultHtml = "";

 for (let i=0;i<10;i++) {
   let rarityRoll = Math.random();
   let rarity = rarityRoll<0.05?"SSR":
                rarityRoll<0.20?"SR":
                rarityRoll<0.50?"R":"N";

   let candidates = allShips.filter(s=>s.rarity===rarity);
   let ship = JSON.parse(JSON.stringify(
     candidates[Math.floor(Math.random()*candidates.length)]
   ));

   ship.maxHp = ship.hp;
   ownedShips.push(ship);

   if (rarity==="SSR") {
     alert("✨ SSR出現！！ ✨");
   }

   resultHtml += `
     <div class="shipCard ${ship.rarity} resultCard">
       <img src="${ship.image}" class="shipImage">
       <div>${ship.name}</div>
       <div>${ship.rarity}</div>
     </div>`;
 }

 document.getElementById("gachaResult").innerHTML = resultHtml;
 gachaUsed = true;
 renderOwnedShips();
}

// ===== 所持艦表示 =====
function renderOwnedShips(){
 let html="";
 ownedShips.forEach((ship,index)=>{
   html+=`
   <div class="shipCard ${ship.rarity}">
    <img src="${ship.image}" class="shipImage">
    <div>${ship.name}</div>
    <button onclick="selectShip(${index})">選択</button>
   </div>`;
 });
 document.getElementById("ownedShips").innerHTML=html;
}

function selectShip(index){
 if(selectedFleet.length>=3) return alert("3隻まで！");
 selectedFleet.push(JSON.parse(JSON.stringify(ownedShips[index])));
 alert(ownedShips[index].name+"を出撃に追加！");
}

// ===== マップ =====
function renderMap(){
 let html="";
 areas.forEach((area,i)=>{
   if(i<=unlockedIndex)
     html+=`<button onclick="startBattle('${area}')">${area}</button>`;
   else html+=`<button disabled>？？？</button>`;
 });
 document.getElementById("map").innerHTML=html;
}

// ===== 戦闘開始 =====
function startBattle(area){
 if(selectedFleet.length!==3) return alert("3隻選択してください");
 playerFleet = JSON.parse(JSON.stringify(selectedFleet));
 currentArea=area;
 enemyFleet=JSON.parse(JSON.stringify(enemyMap[area]));
 battleActive=true;
 turn="player";
 renderAll();
}

// ===== 表示 =====
function renderFleet(fleet, elementId){

 let html="";

 fleet.forEach(ship=>{

   let hpPercent=(ship.hp/ship.maxHp)*100;

   html+=`
   <div class="shipCard ${ship.rarity||''}">
     <img src="${ship.image}" class="shipImage">  <!-- 画像表示部 -->
     <div>${ship.name}</div>
     <div>${ship.hp} / ${ship.maxHp}</div>
     <div class="hpBar" style="width:${hpPercent}%"></div>
   </div>
   `;

 });

 document.getElementById(elementId).innerHTML=html;
}
function renderAll(){
 renderFleet(playerFleet,"playerFleet");
 renderFleet(enemyFleet,"enemyFleet");
}

// ===== ターン制戦闘 =====
function playerAttack(){
 if(!battleActive||turn!=="player") return;

 playerFleet.forEach(ship=>{
  if(ship.hp<=0)return;
  let target=enemyFleet.find(e=>e.hp>0);
  if(!target)return;
  target.hp-=ship.attack;
  if(target.hp<0)target.hp=0;
 });

 checkBattleEnd();
 turn="enemy";
 setTimeout(enemyTurn,1000);
}

function enemyTurn(){
 enemyFleet.forEach(ship=>{
  if(ship.hp<=0)return;
  let target=playerFleet.find(p=>p.hp>0);
  if(!target)return;
  target.hp-=ship.attack;
  if(target.hp<0)target.hp=0;
 });
 checkBattleEnd();
 turn="player";
 renderAll();
}

// ===== 勝敗判定 =====
function checkBattleEnd(){
 let playerAlive=playerFleet.some(s=>s.hp>0);
 let enemyAlive=enemyFleet.some(s=>s.hp>0);

 if(!enemyAlive){
   alert(currentArea+" 制圧成功！");
   battleActive=false;
   if(unlockedIndex<areas.length-1) unlockedIndex++;
   else alert("🎉 全海域制覇！");
   renderMap();
 }

 if(!playerAlive){
   alert("艦隊壊滅…ゲームオーバー");
   battleActive=false;
 }
 renderAll();
}

renderMap();
