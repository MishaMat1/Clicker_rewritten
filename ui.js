const UI = {
    points: document.getElementById("points"),
    clickPower: document.getElementById("ClickPower"),
    clickPowerCost: document.getElementById("clickPowerCost"),
    multiplier: document.getElementById("multiplier"),
    multiplierCost: document.getElementById("multiplierCost"),
    compound: document.getElementById("compound"),
    compoundCost: document.getElementById("compoundCost"),
    autoclickers: document.getElementById("autoclickers"),
    autoclickerCost: document.getElementById("autoclickerCost"),
    idle: document.getElementById("idle"),
    prestige: document.getElementById("prestige"),
    prestigeAmount: document.getElementById("prestigeAmount")
    
}

function updateUI(){
    UI.points.textContent = formatNumber(game.points);
    UI.clickPower.textContent = formatNumber(game.clickPower);
    UI.clickPowerCost.textContent = formatNumber(game.clickPowerCost);
    UI.multiplier.textContent = formatNumber(game.multiplier);
    UI.multiplierCost.textContent = formatNumber(game.multiplierCost);
    UI.compound.textContent = formatNumber(game.compound);
    UI.compoundCost.textContent = formatNumber(game.compoundCost);
    UI.autoclickers.textContent = formatNumber(game.autoclickers);
    UI.autoclickerCost.textContent = formatNumber(game.autoclickerCost);
    UI.idle.textContent = formatNumber(game.autoclickers.mul(getTotalPointMultiplier()).div(5));
    UI.prestige.textContent = formatNumber(game.prestigePoints);

if (game.points.lt(game.prestigeRequirement)) {
    UI.prestigeAmount.textContent = "Requires: " + formatNumber(game.prestigeRequirement);
} else {
    let PrestigeGain = Decimal.log(Decimal.floor(game.points.div(game.prestigeRequirement.div(10))), 10);
    UI.prestigeAmount.textContent = "Prestige gain: +" + formatNumber(PrestigeGain) + " prestige points";
}
}