let lastUpdate = Date.now();

function gameLoop() {
    const now = Date.now();
    const diff = (now - lastUpdate) / 1000;
    lastUpdate = now;

    Idle(diff);

    updateUI();
}

setInterval(gameLoop, 50);

const suffixes = ["K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","Dc"];

function formatNumber(decimal) {
    decimal = new Decimal(decimal); // ensure it's a Decimal

    if(decimal.lt(1000)) return decimal.toFixed(0);

    // calculate tier from the Decimal exponent (base-10)
    // `decimal.e` is the base-10 exponent (e.g. 1000 -> 3), so tier = floor(e/3)-1
    let exponent = decimal.e; // small integer
    let tier = Math.floor(exponent / 3) - 1;

    if(tier >= suffixes.length) return decimal.toExponential(2).replace("e+", "e");

    let scale = new Decimal(10).pow((tier + 1) * 3);
    let scaled = decimal.div(scale);
    let formatted = scaled.toFixed(2).replace(/\.?0+$/,'');

    return formatted + suffixes[tier];
}

function getTotalPointMultiplier() {
    const multipliers = [game.clickPowerEffect, game.multiplierEffect, game.compoundEffect];
    let TotalPointMultiplier = new Decimal(1);
    return multipliers.reduce((total, multiplier) => total.mul(multiplier), TotalPointMultiplier);
}

function pointClick(){
    game.points = game.points.add(getTotalPointMultiplier());
}

function buyClickPower(){
    if(game.points.gte(game.clickPowerCost)){
        game.points = game.points.sub(game.clickPowerCost);
        game.clickPower = game.clickPower.add(1);
        game.clickPowerCost = game.clickPowerCost.mul(1.25);
        game.clickPowerEffect = game.clickPowerEffect.add(1);
    }
}

function buyMultiplier(){
    if(game.points.gte(game.multiplierCost)){
        game.points = game.points.sub(game.multiplierCost);
        game.multiplier = game.multiplier.add(1);
        game.multiplierCost = game.multiplierCost.mul(1.25);
        game.multiplierEffect = game.multiplierEffect.add(1);
    }
}

function buyCompound(){
    if(game.points.gte(game.compoundCost)){
        game.points = game.points.sub(game.compoundCost);
        game.compound = game.compound.add(1);
        game.compoundCost = game.compoundCost.mul(3);
        game.compoundEffect = game.compoundEffect.mul(2);
    }
}

function buyAutoclicker(){
    if(game.points.gte(game.autoclickerCost)){
        game.points = game.points.sub(game.autoclickerCost);
        game.autoclickers = game.autoclickers.add(1);
        game.autoclickerCost = game.autoclickerCost.mul(3);
    }
}

function Idle(diff){
    let pointsFromAutoclickers = game.autoclickers.mul(getTotalPointMultiplier()).mul(diff / 5);
    game.points = game.points.add(pointsFromAutoclickers);
}