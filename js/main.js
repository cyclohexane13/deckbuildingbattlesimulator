

var cardDeck = [];
var cardHand = [];
var cardGrave = [];
var enemy = [];
var player;
var turn;
var logger = " - 전투 로그 - \n";
var min_hp = 0;
var max_hp = 0;


var cardsList = [
    {
        "name" : "어택",
        "cost" : 1,
        "effectText" : "대상에게 "+ 6 +" 데미지를 줍니다.",
        "effect" : {
            "isAttack" : true,
            "isEntire" : false,
            "damage" : 6
        }
    },
    {
        "name" : "가드",
        "cost" : 1,
        "effectText" : "방어도를 "+ 4 +" 얻습니다.",
        "effect" : {
            "isAttack" : false,
            "guard" : 4
        }
    },
    {
        "name" : "찌르기",
        "cost" : 1,
        "effectText" : "적 전체에 "+ 4 +" 데미지를 줍니다.",
        "effect" : {
            "isAttack" : true,
            "isEntire" : true,
            "damage" : 4
        }
    },
    {
        "name" : "호흡",
        "cost" : 0,
        "effectText" : "다음 턴 시작시 코스트를 "+ 1 +" 얻습니다.",
        "effect" : {
            "isAttack" : false,
            "breath" : 1
        }
    },
]

var intendList =[
    {
        "damage" : 0,
        "guard" : 0,
        "vnr" : 0,
        "wound" : 0
    },
    {
        "damage" : 0,
        "guard" : 0,
        "vnr" : 0,
        "wound" : 0
    },
    {
        "damage" : 0,
        "guard" : 0,
        "vnr" : 0,
        "wound" : 0
    }
]



class Card {
    name;
    cost;
    effectText;
    effect;
    
    constructor(idx){
        this.name = cardsList[idx].name;
        this.cost = cardsList[idx].cost;
        this.effectText = cardsList[idx].effectText;
        this.effect = cardsList[idx].effect;
    }
    
    
    
}

class Player {
    
    vnr;
    guard;
    takenDmg;
    breath;
    cost;
    
    constructor(){
        this.vnr = 0;
        this.guard = 0;
        this.takenDmg = 0;
        this.breath = 0;
        this.cost = 3;
    }
    
    damage(dmg){
        
        var dmgs = dmg;
        if(this.vnr > 0){
            dmgs = Math.floor(dmgs*1.5);
        }
        if(this.guard >= dmgs){
            this.guard -= dmgs;
            dmgs = 0;
        }else{
            dmgs -= this.guard;
            this.guard = 0;
        }
        this.takenDmg += dmgs
        logger += " " + dmgs + "데미지! \n"
    }
    
    startTurn(){
        this.cost = 3;
        this.guard = 0;
        if(this.vnr > 0){
            this.vnr --
        }
        if(this.breath > 0){
            this.cost++
            this.breath--
        }
    }
}


class Ghoul{
    name;
    maxHP;
    HP;
    str;
    guard;
    wound;
    intend;
    
    constructor(){
        this.name = "Ghoul";
        this.maxHP = (Math.floor(Math.random()*(Math.abs(max_hp-min_hp)+1)) + min_hp);
        this.HP = this.maxHP;
        this.str = 0;
        this.guard = 0;
        this.wound = 0;
        this.intend = this.generateIntend();
    }
    
    generateIntend() {
        // var intend = {
        //     "damage" : 0,
        //     "guard" : 0,
        //     "vnr" : 0,
        //     "wound" : 0
        // }
        // switch (Math.floor(Math.random()*3)) {
        //     case 0:
        //         intend.damage = 6
        //         intend.wound = 1
        //         break;
        //     case 1:
        //         intend.damage = 4
        //         intend.vnr = 1
        //         intend.wound = 1
        //         break;
                
        //     default:
        //         intend.guard = 4
        //         break;
        // }
        
        
        return intendList[Math.floor(Math.random()*3)];
    }
    
    damage(dmg){
        var dmgs = this.wound + dmg;
        if(this.guard >= dmgs){
            this.guard -= dmgs;
            dmgs = 0;
        }else{
            dmgs -= this.guard;
            this.guard = 0;
        }
        this.HP -= dmgs
        logger += " " + dmgs + "데미지! \n";
    }
    
    startTurn(){
        this.guard = 0;
    }
}



function init(){
    player = new Player();

    
    shuffle(cardDeck);
    
    for(i=0; i<5 ; i++){
        draw();
    }
    turn = 1;
    logger+= "\n " + turn +"번째 턴 시작";
    featureUpdate();
    
}

function startPlayerTurn(){
    discardHand();
    for(i=0; i<5 ; i++){
        draw();
    }
    player.startTurn();
    turn++;
    logger += "\n " + turn +"번째 턴 시작";
    featureUpdate();
}

function endTurn(){
    logger += "\n " + turn +"번째 턴 종료";
    
    featureUpdate();
    enemy.forEach(e => {
        e.startTurn();
        processIntend(e);
        e.intend = e.generateIntend();
    });
    featureUpdate();
    startPlayerTurn();
}


function shuffle(arr){
    arr.sort(() => Math.random() - 0.5);
}

function reShuffle(){
    cardDeck = cardGrave;
    shuffle(cardDeck);
    cardGrave = [];
}

function draw(){
    if(cardDeck.length == 0){
        cardDeck=[]
        reShuffle();
    }
    cardHand.push(cardDeck.shift());
}
function discardHand(){
    
    
    // for(i=0; i<cardHand.length; i++){
    //     cardGrave.push(cardHand.shift());
    // }
    // cardHand=[]
    while(cardHand.length>0){
        cardGrave.push(cardHand.shift());
    
    }
    cardHand=[]
}


function selectCard(idx){
    var selectedCard = cardHand[idx];
    var eff = selectedCard.effect;
    if(player.cost <selectedCard.cost){
        alert("코스트가 부족합니다");
        return;
    }
    var enemyIdx = -1
    if(eff.isAttack && !eff.isEntire){
        enemyIdx = prompt("몇번째 적을 공격할까요? \n숫자로 입력해주세요", "");
        if(Number.isInteger(enemyIdx)){
            alert("숫자로 입력해주세요");
            return
        }
        
        if(enemyIdx > enemy.length || enemyIdx <= 0){
            alert("범위 밖의 숫자를 입력하였습니다.")
            return
        }
    }
    
    useCard(idx, enemyIdx-1);
}

function killEnemy(idx){
    enemy.splice(idx,1);
    document.getElementsByClassName("enemy")[idx].remove();
}

function useCard(cardIdx, targetIdx){
    var selectedCard = cardHand[cardIdx];
    var target = targetIdx >= 0? enemy[targetIdx] : -1;
    var eff = selectedCard.effect;
    player.cost -= selectedCard.cost;
    if(eff.isAttack && !eff.isEntire){
        logger += "\n" + (targetIdx+1) + "번째 적에게 " + selectedCard.name + " 사용"
        target.damage(eff.damage);
    }else if(eff.isAttack && eff.isEntire){
        logger += "\n" + selectedCard.name + " 카드 사용";
        enemy.forEach(element => {
            element.damage(eff.damage);
        });
    }else{
        if(eff.hasOwnProperty("breath")){
            logger+="\n" + selectedCard.name + " 카드 사용";
            player.breath += eff.breath;
        }
        if(eff.hasOwnProperty("guard")){
            
            player.guard += eff.guard;
            logger += "\n" + selectedCard.name + " 카드 사용, 방어도 : " + player.guard;
        
        }
    }
    
    for(i =enemy.length -1; i>=0 ; i--){
        if(enemy[i].HP<=0){
            logger+= "\n 적 1체 사망 ";
            
            killEnemy(i);
        }
    }
    cardGrave.push(selectedCard);
    cardHand.splice(cardIdx,1)
    featureUpdate();
}

function processIntend(enemyObj){
    var intend = enemyObj.intend;
    logger += "\n 적의 " + intendToString(enemyObj) + " 행동";
    
    if(intend.damage > 0){
        player.damage(intend.damage);
    }
    if(intend.vnr > 0){
        player.vnr += intend.vnr;
    }
    if(intend.guard>0){
        enemyObj.guard+= intend.guard;
    }
    if(intend.wound>0){
        enemyObj.wound += intend.wound;
    }
    
}

function drawPlayer(){
    var dmg = document.getElementById("player_damage");
    var guard = document.getElementById("player_guard");
    var vnr = document.getElementById("player_vnr");
    var breath = document.getElementById("breath");
    var cost = document.getElementById("cost");
    
    dmg.innerText = "받은 데미지 : " + player.takenDmg;
    
    guard.innerText = "방어 : " + player.guard;
    if(player.guard == 0){
        guard.style.display = "none"
    }else{
        guard.style.display = "initial"
    }
    
    vnr.innerText = "취약 : " + player.vnr;
    if(player.vnr == 0){
        vnr.style.display = "none"
    }else{
        vnr.style.display = "initial"
    }
    
    breath.innerText = "호흡 : " + player.breath;
    if(player.breath == 0){
        breath.style.display = "none"
    }else{
        breath.style.display = "initial"
    }
    
    cost.innerText = "남은 코스트 : " + player.cost;
}


function intendToString(enemy){
    var intend =enemy.intend;
    var intendList = [];
    if(intend.damage > 0){
        var dmg = intend.damage;
        if(player.vnr>0){
            dmg = Math.floor(dmg*1.5);
        }
        intendList.push(" " + dmg + " 데미지")
    }
    if(intend.guard > 0){
        intendList.push("방어");
    }
    
    if(intend.vnr > 0){
        intendList.push("나쁜 효과")
    }
    
    var intendText = intendList.join(" 와 ")
    
    return intendText
}


function drawEnamy(){
    for(i=0; i<enemy.length; i++){
        var enemyObject = enemy[i];
        var intend = document.getElementsByClassName("enemy_intend")[i];
        intend.innerText = intendToString(enemyObject);
        
        var enemyHP = document.getElementsByClassName("enemy_HP")[i];
        enemyHP.innerText = "남은 체력 : " + enemyObject.HP;
        
        var enemyGuard = document.getElementsByClassName("enemy_guard")[i];
        enemyGuard.innerText = "방어 : " + enemyObject.guard;
        if(enemyObject.guard == 0){
            enemyGuard.style.display = "none"
        }else{
            enemyGuard.style.display = "initial"
        }
        
        var enemyStr = document.getElementsByClassName("enemy_str")[i];
        enemyStr.innerText = "힘 : " + enemyObject.str;
        if(enemyObject.str == 0){
            enemyStr.style.display = "none"
        }else{
            enemyStr.style.display = "initial"
        }
        
        var enemyWound = document.getElementsByClassName("enemy_wound")[i];
        enemyWound.innerText = "부상 : " + enemyObject.wound;
        if(enemyObject.wound == 0){
            enemyWound.style.display = "none"
        }else{
            enemyWound.style.display = "initial"
        }
    }
}

function drawChracters(){
    drawPlayer();
    drawEnamy();
}

function drawlogger(){
    document.getElementById("log").innerText = logger;

}
function drawTurnText(){
    document.getElementById("turns").innerText = "현재 턴 : " + turn;
}

function drawDeck(){
    document.getElementById("decks").innerText = "남은 덱 : " + cardDeck.length;
};


function drawGrave(){
    document.getElementById("graves").innerText = "사용한 카드 : " +cardGrave.length;
}

function drawHand(){
    for(i=0 ;i<5; i++){
        document.getElementsByClassName("card")[i].style.display = "none"
    }
    for(i=0; i<cardHand.length; i++){
        var cardObj = cardHand[i]
        var cardName = document.getElementsByClassName("card_name")[i];
        cardName.innerText = cardObj.name
        
        var cardCost = document.getElementsByClassName("card_cost")[i];
        cardCost.innerText = cardObj.cost + " 코스트"
        
        var cardText = document.getElementsByClassName("card_text")[i];
        cardText.innerText = cardObj.effectText
        
        var cardElement = document.getElementsByClassName("card")[i];
        cardElement.style.display = "initial"
        
    }
}


function drawCardsArea(){
    drawTurnText();
    drawDeck();
    drawHand();
    drawGrave();
    drawlogger();
}


function featureUpdate(){
    drawChracters();
    drawCardsArea();
    
}

function setCard(){
    var card1cost = +document.getElementsByName("card_1_cost_set")[0].value
    var card1damage = +document.getElementsByName("card_1_damage_set")[0].value
    var card1copy = +document.getElementsByName("card_1_copy_set")[0].value
    
    var card2cost = +document.getElementsByName("card_2_cost_set")[0].value
    var card2guard = +document.getElementsByName("card_2_guard_set")[0].value
    var card2copy = +document.getElementsByName("card_2_copy_set")[0].value
    
    var card3cost = +document.getElementsByName("card_3_cost_set")[0].value
    var card3damage = +document.getElementsByName("card_3_damage_set")[0].value
    var card3copy = +document.getElementsByName("card_3_copy_set")[0].value
    
    var card4cost = +document.getElementsByName("card_4_cost_set")[0].value
    var card4breath = +document.getElementsByName("card_4_breath_set")[0].value
    var card4copy = +document.getElementsByName("card_4_copy_set")[0].value
    
    cardsList = [
        {
            "name" : "어택",
            "cost" : card1cost,
            "effectText" : "대상에게 "+ card1damage +" 데미지를 줍니다.",
            "effect" : {
                "isAttack" : true,
                "isEntire" : false,
                "damage" : card1damage
            }
        },
        {
            "name" : "가드",
            "cost" : card2cost,
            "effectText" : "방어도를 "+ card2guard +" 얻습니다.",
            "effect" : {
                "isAttack" : false,
                "guard" : card2guard
            }
        },
        {
            "name" : "찌르기",
            "cost" : card3cost,
            "effectText" : "적 전체에 "+ card3damage +" 데미지를 줍니다.",
            "effect" : {
                "isAttack" : true,
                "isEntire" : true,
                "damage" : card3damage
            }
        },
        {
            "name" : "호흡",
            "cost" : card4cost,
            "effectText" : "다음 턴 시작시 코스트를 "+ card4breath +" 얻습니다.",
            "effect" : {
                "isAttack" : false,
                "breath" : card4breath
            }
        },
    ]
    
    for(i = 0; i<card1copy; i++){
        cardDeck.push(new Card(0));
    }
    for(i = 0; i<card2copy; i++){
        cardDeck.push(new Card(1));
    }
    for(i = 0; i<card3copy; i++){
        cardDeck.push(new Card(2));
    }
    for(i = 0; i<card4copy; i++){
        cardDeck.push(new Card(3));
    }
    
}

function setEnemy(){
    
    min_hp = +document.getElementsByName("min_hp")[0].value
    max_hp = +document.getElementsByName("max_hp")[0].value
    
    var intend1damage = +document.getElementsByName("intend_1_damage_set")[0].value
    
    var intend2damage = +document.getElementsByName("intend_2_damage_set")[0].value
    var intend2vnr = +document.getElementsByName("intend_2_vnr_set")[0].value
    
    var intend3guard = +document.getElementsByName("intend_3_guard_set")[0].value
    
    intendList[0].damage = intend1damage;
    intendList[0].wound = 1;
    
    intendList[1].damage = intend2damage;
    intendList[1].vnr = intend2vnr;
    intendList[1].wound = 1;
    
    intendList[2].guard = intend3guard;
    
    enemy.push(new Ghoul());
    enemy.push(new Ghoul());
}


function startSim(){
    document.getElementById("setting").style.display = "none"
    document.getElementById("simulator").style.display = "initial"
    setCard();
    setEnemy();
    init();
}




