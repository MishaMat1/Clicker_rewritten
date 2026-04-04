const UI = {
    points: document.getElementById("points"),
    idle: document.getElementById("idle"),
    prestige: document.getElementById("prestige"),
    prestigeAmount: document.getElementById("prestigeAmount"),
    charge: document.getElementById("chargeText"),
    chargeGen: document.getElementById("chargeGen"),
    ascension: document.getElementById("ascension"),
    ascensionAmount: document.getElementById("ascendAmount")
}

function updateSubtabUnlocks() {
    document.getElementById("chargeButton").style.display =
        hasPrestigeUpgrade(13) ? "inline-block" : "none";
}

function updateUI(){
    UI.points.textContent = formatNumber(game.points);
    UI.idle.textContent = formatNumber(PointUpgrades[3].effect(3).mul(getTotalPointMultiplier()).div(5).mul(PrestigeUpgBuyMultiplier("autoclicker")));
    UI.prestige.textContent = formatNumber(game.prestigePoints);
    UI.charge.textContent = formatNumber(game.charge)
    UI.chargeGen.textContent = formatNumber(new Decimal(1).mul(getChargeMultiplier()))
    UI.ascension.textContent = formatNumber(game.ascensionPoints)

    if (game.points.lt(game.prestigeRequirement)) {
        UI.prestigeAmount.textContent = "Requires: " + formatNumber(game.prestigeRequirement);
    } else {
        UI.prestigeAmount.textContent = `+ ${formatNumber(GetPrestigeGain())} prestige points`;
    }
    if (game.prestigePoints.lt(game.ascendRequirement)) {
        UI.ascensionAmount.textContent = "Requires: " + formatNumber(game.ascendRequirement);
    } else {
        UI.ascensionAmount.textContent = `+ ${formatNumber(GetAscensionGain())} ascension points`
    }
    updateSubtabUnlocks();
    updatePointUpgradesUI();
}