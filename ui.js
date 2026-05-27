const UI = {
    points: document.getElementById("points"),
    idle: document.getElementById("idle"),
    prestigeAmount: document.getElementById("prestigeAmount"),
    prestigeDisplay: document.querySelectorAll(".prestigeDisplay"),
    charge: document.getElementById("chargeText"),
    chargeGen: document.getElementById("chargeGen"),
    ascension: document.getElementById("ascension"),
    ascensionAmount: document.getElementById("ascendAmount"),
    supercharge: document.getElementById("superchargeText"),
    superchargeAmount: document.getElementById("superchargeAmount"),
}

function updateSubtabUnlocks() {
    document.getElementById("chargeButton").style.display =
        hasPrestigeUpgrade(13) ? "inline-block" : "none";
}

function updateUI() {
    UI.points.textContent = formatNumber(game.points);
    UI.idle.textContent = formatNumber(PointUpgrades[3].effect(3).mul(getTotalPointMultiplier()).div(5).mul(getEffects("autoclicker", "multiplier")));
    UI.prestigeDisplay.forEach(display => {
        display.textContent = formatNumber(game.prestigePoints);
    });
    if (inChallenge(3)) {
        UI.charge.textContent = formatNumber(game.darkCharge);
    } else {
        UI.charge.textContent = formatNumber(game.charge);
    }
    if (inChallenge(3)) {
        UI.chargeGen.textContent = formatNumber(new Decimal(1))
    } else {
        UI.chargeGen.textContent = formatNumber(new Decimal(1).mul(getChargeMultiplier()))
    }
    UI.ascension.textContent = formatNumber(game.ascensionPoints)
    UI.supercharge.textContent = formatNumber(game.supercharge)

    if (game.points.lt(game.prestigeRequirement)) {
        UI.prestigeAmount.textContent = "Requires: " + formatNumber(game.prestigeRequirement) + " points";
    } else {
        UI.prestigeAmount.textContent = `+ ${formatNumber(GetPrestigeGain())} prestige points`;
    }
    if (game.prestigePoints.lt(game.ascendRequirement)) {
        UI.ascensionAmount.textContent = "Requires: " + formatNumber(game.ascendRequirement) + " PP";
    } else {
        UI.ascensionAmount.textContent = `+ ${formatNumber(GetAscensionGain())} ascension points`
    }
    if (game.charge.lt(game.superchargeRequirement)) {
        UI.superchargeAmount.textContent = "Requires: " + formatNumber(game.superchargeRequirement) + " charge";
    } else {
        UI.superchargeAmount.textContent = `+ ${formatNumber(getSuperchargeGain())} supercharge`;
    }
    updateSubtabUnlocks();
    updatePointUpgradesUI();
    updatePrestigeBuyablesUI();
    updateChargeMilestones();
    updateAscensionMilestones();
    updateEffectDescription();
    updateNerfDescription();
    updateChallenges();
    updateChallengeUI();
}