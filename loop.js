function loop() {
    game.pointAuto.level = 0;
    game.prestigeAuto.level = 0;
    game.prestigeAuto.enabled = false;
    game.ascensionPoints = new Decimal(0);
    game.TotalAscensionPoints = new Decimal(0);
    game.ascensionResetAmount = new Decimal(0);
    game.supercharge = new Decimal(0);
    game.totalSupercharge = new Decimal(0);
    game.activeChallenge = null;
    game.ascensionUpgradesBought.forEach((_, i) => {
        game.ascensionUpgradesBought[i] = false;
    });
    game.ascensionMilestones.forEach((_, i) => {
        game.ascensionMilestones[i] = false;
    });
    game.superchargeUpgradeLevels.forEach((_, i) => {
        game.superchargeUpgradeLevels[i] = new Decimal(0);
    });
    game.challengeCompletions = {
        0: 0,
        1: 0,
        2: 0,
        3: 0
    };
    ascendReset();
    loadAscensionMilestones();
    generateAutomationUI();
    loadPrestigeUpgrades();
    loadAscensionUpgrades();
    game.LP = game.LP.add(1);
    game.LP_resetAmount = game.LP_resetAmount.add(1);
    document.querySelectorAll(".loopContentText").forEach(el => el.style.display = "block");
    loadLoopUpgrades();
}

let LoopUpgrades = [
    {
        id: 0,
        name: "Loopy points",
        description: "Points are boosted based on times looped",
        effectType: "multiplier",
        type: "points",
        cost: new Decimal(1),
        effect() {
            return new Decimal(2).pow(game.LP_resetAmount);
        },
        effectDescription() {
            return "Currently: x" + formatNumber(this.effect());
        }
    },
    {
        id: 1,
        name: "Loopy prestige",
        description: "Prestige points are boosted based on times looped",
        effectType: "multiplier",
        type: "prestige",
        cost: new Decimal(1),
        effect() {
            return new Decimal(2).pow(game.LP_resetAmount);
        },
        effectDescription() {
            return "Currently: x" + formatNumber(this.effect());
        }
    },
    {
        id: 2,
        name: "Loopy ascension",
        description: "Ascension points are boosted based on times looped",
        effectType: "multiplier",
        type: "ascension",
        cost: new Decimal(1),
        effect() {
            return new Decimal(2).pow(game.LP_resetAmount);
        },
        effectDescription() {
            return "Currently: x" + formatNumber(this.effect());
        }
    },
    {
        id: 3,
        name: "Loopy charge",
        description: "Charge is boosted based on times looped",
        effectType: "multiplier",
        type: "charge",
        cost: new Decimal(1),
        effect() {
            return new Decimal(2).pow(game.LP_resetAmount);
        },
        effectDescription() {
            return "Currently: x" + formatNumber(this.effect());
        }
    },
    {
        id: 4,
        name: "Loopy supercharge",
        description: "Supercharge is boosted based on times looped",
        effectType: "multiplier",
        type: "supercharge",
        cost: new Decimal(1),
        effect() {
            return new Decimal(2).pow(game.LP_resetAmount);
        },
        effectDescription() {
            return "Currently: x" + formatNumber(this.effect());
        }
    },
    {
        id: 5,
        name: "Loopy ascension resets",
        description: "Ascension resets are boosted based on times looped",
        effectType: "multiplier",
        type: "ascension-reset",
        cost: new Decimal(1),
        effect() {
            return new Decimal(2).pow(game.LP_resetAmount);
        },
        effectDescription() {
            return "Currently: x" + formatNumber(this.effect());
        }
    }
]

function loadLoopUpgrades() {
    let container = document.getElementById("loopUpgrades");
    container.innerHTML = "";
    LoopUpgrades.forEach(upg => {
        let button = document.createElement("button");
        if(game.LoopUpgradesBought && game.LoopUpgradesBought[upg.id] === true) {
            button.innerHTML = upg.name + "<br>" + upg.description + "<br>Bought";
            if(upg.effectDescription) {
            button.innerHTML += "<br>" + upg.effectDescription();
        }
            button.disabled = true;
        } else {
        button.innerHTML = upg.name + "<br>" + upg.description + "<br>" + formatNumber(upg.cost) + " LP";
        if(upg.effectDescription) {
            button.innerHTML += "<br>" + upg.effectDescription();
        }
    }
        button.onclick = function() {
            buyLoopUpgrade(upg.id);
        };
        container.appendChild(button);
    });
}

function buyLoopUpgrade(id) {
    let upg = LoopUpgrades[id];
    if(game.LP.gte(upg.cost) && game.LoopUpgradesBought[id] === false) {
        game.LP = game.LP.sub(upg.cost);
        game.LoopUpgradesBought[id] = true;
        if(upg.effect) upg.effect();
        loadLoopUpgrades();
    }
}