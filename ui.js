const UI = {
    points: document.getElementById("points"),
    idle: document.getElementById("idle"),
    prestige: document.getElementById("prestige"),
    prestigeAmount: document.getElementById("prestigeAmount")
}

function updateUI(){
    UI.points.textContent = formatNumber(game.points);
    UI.idle.textContent = formatNumber(PointUpgrades[3].level.mul(getTotalPointMultiplier()).div(5).mul(PointUpgrades[3].effect()).mul(PrestigeUpgBuyMultiplier("autoclicker")));
    UI.prestige.textContent = formatNumber(game.prestigePoints);

if (game.points.lt(game.prestigeRequirement)) {
    UI.prestigeAmount.textContent = "Requires: " + formatNumber(game.prestigeRequirement);
} else {
    UI.prestigeAmount.textContent = `+ ${formatNumber(GetPrestigeGain())} prestige points`;
}
}