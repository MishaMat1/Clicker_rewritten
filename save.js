let isResetting = false;

function saveGame() {

    if (isResetting) return;

    game.version = CURRENT_VERSION;
    localStorage.setItem("myClickerSave", JSON.stringify(game));
}
setInterval(saveGame, 5000);

function loadGame() {
    const save = localStorage.getItem("myClickerSave");
    if (save) {
        const data = JSON.parse(save);
        Object.assign(game, data);
    }

    if (!game.version)
        game.version = "1.3.0";

    if (compareVersions(game.version, CURRENT_VERSION) < 0)
        migrateSave(game.version);


    safeInitialize()
    DecimalConverter();

    applyPermanentUnlocks();
    loadPrestigeUpgrades();
    loadPrestigeCharge();
    loadAscensionUpgrades();
    loadAscensionMilestones();
    generateAutomationUI();

    if (game.prestigeResetAmount.gte(1) || game.ascensionResetAmount.gte(1)) {
        document.getElementById("prestigeTabButton").style.display = "inline-block";
    }

    if (game.ascensionResetAmount.gte(1)) {
        document.getElementById("ascendTabButton").style.display = "inline-block";
    }
    if (hasPrestigeUpgrade(9)) {
        document.getElementById("automationButton").style.display = "inline-block";
    }
    if (game.completedChallenges[3]) {
        document.getElementById("superchargeContainer").style.display = "inline-block";
    }
    if (game.totalSupercharge.gt(0)) {
        loadSuperchargeUpgrades();
    }
}

function resetGame() {
    let hard_reset = prompt("Type CONFIRM to hard reset")
    if (hard_reset === "CONFIRM") {

        isResetting = true;

        localStorage.removeItem("myClickerSave");
        location.reload();
    }
    if (hard_reset === "cool_meme?") {
        alert("67 (yeah i know this is just brainrot meme)")
    }

    if (hard_reset === "SPEED_I_NEED_THIS") {
        game.points = new Decimal(1e100);
    }
}

function compareVersions(v1, v2) {

    const a = v1.split(".").map(Number);
    const b = v2.split(".").map(Number);

    for (let i = 0; i < Math.max(a.length, b.length); i++) {

        let n1 = a[i] || 0;
        let n2 = b[i] || 0;

        if (n1 > n2) return 1;
        if (n1 < n2) return -1;
    }

    return 0;
}

function migrateSave(oldVersion) {
    console.log("Migrating save from", oldVersion, "to", CURRENT_VERSION);
    game.version = CURRENT_VERSION;
    if (compareVersions(oldVersion, "1.3.0") < 0) {
        if (!game.prestigeAuto)
            game.prestigeAuto = {
                enabled: false,
                timer: 0,
                level: 0,
                maxLevel: 19
            };
    }
    if (compareVersions(oldVersion, "1.4.0") < 0) {
        if (!game.darkChargeNerfs)
            game.darkChargeNerfs = [];

        if (!game.superchargeUpgradeLevels)
            game.superchargeUpgradeLevels = [];

        if (!game.completedChallenges)
            game.completedChallenges = [];

        if (game.activeChallenge === undefined)
            game.activeChallenge = null;
    }
}

function DecimalConverter() {
    game.points = new Decimal(game.points);
    game.prestigePoints = new Decimal(game.prestigePoints);
    game.prestigeRequirement = new Decimal(game.prestigeRequirement);
    game.prestigeResetAmount = new Decimal(game.prestigeResetAmount);
    game.charge = new Decimal(game.charge);
    game.ascensionPoints = new Decimal(game.ascensionPoints);
    game.TotalAscensionPoints = new Decimal(game.TotalAscensionPoints);
    game.ascensionResetAmount = new Decimal(game.ascensionResetAmount);
    game.ascendRequirement = new Decimal(game.ascendRequirement);
    game.darkCharge = new Decimal(game.darkCharge);
    game.supercharge = new Decimal(game.supercharge);
    game.TotalAscensionPoints = new Decimal(game.TotalAscensionPoints);
    game.totalSupercharge = new Decimal(game.totalSupercharge);

    game.pointUpgradeLevels = game.pointUpgradeLevels.map(x => new Decimal(x));
    game.prestigeBuyableLevels = game.prestigeBuyableLevels.map(x => new Decimal(x));

}

function safeInitialize() {
    if (!game.pointUpgradeLevels)
        game.pointUpgradeLevels = [];

    if (!game.prestigeUpgradesBought)
        game.prestigeUpgradesBought = [];

    if (!game.prestigeBuyableLevels)
        game.prestigeBuyableLevels = [];

    if (!game.chargeMilestones)
        game.chargeMilestones = [];

    if (!game.darkChargeNerfs)
        game.darkChargeNerfs = [];

    if (!game.superchargeUpgradeLevels)
        game.superchargeUpgradeLevels = [];

    if (!game.ascensionUpgradesBought)
        game.ascensionUpgradesBought = [];

    if (!game.ascensionMilestones)
        game.ascensionMilestones = [];

    if (!game.completedChallenges)
        game.completedChallenges = [];

    if (game.activeChallenge === undefined)
        game.activeChallenge = null;

    PointUpgrades.forEach((_, i) => {
        if (!game.pointUpgradeLevels[i] === undefined)
            game.pointUpgradeLevels[i] = new Decimal(0);
    });

    PrestigeUpgrades.forEach((_, i) => {
        if (game.prestigeUpgradesBought[i] === undefined)
            game.prestigeUpgradesBought[i] = false;
    });

    PrestigeBuyables.forEach((_, i) => {
        if (game.prestigeBuyableLevels[i] === undefined)
            game.prestigeBuyableLevels[i] = new Decimal(0);
    });

    ChargeMilestones.forEach((_, i) => {
        if (game.chargeMilestones[i] === undefined)
            game.chargeMilestones[i] = false;
    });

    DarkChargeNerfs.forEach((_, i) => {
        if (game.darkChargeNerfs[i] === undefined)
            game.darkChargeNerfs[i] = false;
    });

    SuperchargeUpgrades.forEach((_, i) => {
        if (game.superchargeUpgradeLevels[i] === undefined)
            game.superchargeUpgradeLevels[i] = new Decimal(0);
    });

    AscensionUpgrades.forEach((_, i) => {
        if (game.ascensionUpgradesBought[i] === undefined)
            game.ascensionUpgradesBought[i] = false;
    });

    AscensionMilestones.forEach((_, i) => {
        if (game.ascensionMilestones[i] === undefined)
            game.ascensionMilestones[i] = false;
    });
}

function applyPermanentUnlocks() {

    if (hasPrestigeUpgrade(15)) {
        document.getElementById("ascension-box").style.display = "block";
    }

    if (hasAscensionUpgrade(10)) {
        document.getElementById("AscChallenges").style.display = "inline-block";
    }
}
window.onload = function () {
    loadGame();
    renderPointUpgrades();
    loadAscensionChallenges();
}

window.onbeforeunload = saveGame;