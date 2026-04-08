function ascendReset() {
    game.points = new Decimal(0)
    game.prestigePoints = new Decimal(0)
    game.charge = new Decimal(0)
    if(hasAscensionMilestone(4)) {
        game.pointAuto.level = 19
    } else if(hasAscensionMilestone(2)) {
            game.pointAuto.level = 10
    } else {
        game.pointAuto.level = 0
    }
    game.pointUpgradeLevels.forEach((_, i) => {
        game.pointUpgradeLevels[i] = new Decimal(0);
    });
   game.prestigeUpgradesBought = game.prestigeUpgradesBought.map((bought, i) => {
    return PrestigeUpgrades[i] && PrestigeUpgrades[i].permanent ? bought : false;
   });
    game.prestigeBuyableLevels.forEach((_, i) => {
        game.prestigeBuyableLevels[i] = new Decimal(0);
    });
    game.chargeMilestones = game.chargeMilestones.map(() => false);
    game.prestigeResetAmount = new Decimal(0)
    }

function GetAscensionGain(){
    if(game.prestigePoints.gte(game.ascendRequirement)){
        let ratio = game.prestigePoints.div(game.ascendRequirement.div(10));
        let AscendLogGain = ratio.log10()
        return new Decimal(AscendLogGain).pow(1.5).floor();
    }
}

function ascend() {
    if (game.prestigePoints.gte(game.ascendRequirement)) {
        document.getElementById("ascendTabButton").style.display = "inline-block";
        let gain = GetAscensionGain();
        game.ascensionPoints = game.ascensionPoints.add(gain);
        game.TotalAscensionPoints = game.TotalAscensionPoints.add(gain)
        game.ascensionResetAmount = game.ascensionResetAmount.add(1)

        ascendReset();

        loadPrestigeUpgrades();
        loadAscensionUpgrades();
        loadAscensionMilestones();
        generateAutomationUI();
    }
}

function loadAscensionUpgrades() {
    let upgradeContainer = document.getElementById("ascUpgradesContainer");

    upgradeContainer.replaceChildren();
    upgradeContainer.appendChild(document.createTextNode("Ascension: " + formatNumber(game.ascensionPoints)));
    upgradeContainer.appendChild(document.createElement("br"));
    AscensionUpgrades.forEach((upg, id) => {
        let button = document.createElement("button");
        if(game.ascensionUpgradesBought[id] === true) {
            button.innerHTML = upg.name + "<br>" + upg.description + "<br>Bought";
            if(upg.effectDescription) {
            button.innerHTML += "<br>" + upg.effectDescription();
        }
            button.disabled = true;
        } else {
        button.innerHTML = upg.name + "<br>" + upg.description + "<br>" + formatNumber(upg.cost) + " AP";
        if(upg.effectDescription) {
            button.innerHTML += "<br>" + upg.effectDescription();
        }
    }
        button.onclick = function() {
            buyAscensionUpgrade(id);
        };
        upgradeContainer.appendChild(button);
    });
}

let AscensionUpgrades = [
    {
        id: 0,
        name: "Welcome to the new layer",
        description: "x10 points",
        type: "points",
        cost: new Decimal(1),
        permament: false,
        effect() {
            return new Decimal(10)
        }
    },
    {
        id: 1,
        name: "More prestige",
        description: "x2 PP",
        type: "prestige",
        cost: new Decimal(1),
        permament: false,
        effect() {
            return new Decimal(2)
        }
    },
    {
        id: 2,
        name: "More charge",
        description: "x2 charge",
        type: "charge",
        cost: new Decimal(2),
        permament: false,
        effect() {
            return new Decimal(2)
        }
    },
    {
        id: 3,
        name: "Less useless",
        description: "Multiplier boosts click power",
        type: "upgrade-boost",
        cost: new Decimal(5),
        permament: false,
        effect() {
            return PointUpgrades[1].effect(1)
        }
    },
    {
        id: 4,
        name: "Ascension points boost",
        description: "Boost points based on ascension resets amount",
        cost: new Decimal(10),
        formula: new Decimal(0.6),
        type: "points",
        effect() {
            return game.ascensionResetAmount.pow(this.formula)
        },
        effectDescription() {
            return "Currently: x" + formatEffect(this.effect());
        }
    },
    {
        id: 5,
        name: "Ascension prestige boost",
        description: "Boost prestige points based on ascension resets amount",
        cost: new Decimal(20),
        formula: new Decimal(0.5),
        type: "prestige",
        effect() {
            return game.ascensionResetAmount.pow(this.formula)
        },
        effectDescription() {
            return "Currently: x" + formatEffect(this.effect());
        }
    },
    {
        id: 6,
        name: "Better formula",
        description: "<b>Dynamic point boost</b> uses a better formula",
        type: "points",
        cost: new Decimal(30),
        permament: false
    }
]

function buyAscensionUpgrade(id) {
    let upg = AscensionUpgrades[id];
    if(game.ascensionPoints.gte(upg.cost) && game.ascensionUpgradesBought[id] === false) {
        game.ascensionPoints = game.ascensionPoints.sub(upg.cost);
        game.ascensionUpgradesBought[id] = true;
        if(upg.effect) upg.effect();
        loadAscensionUpgrades();
        loadPrestigeUpgrades();
        renderPointUpgrades();
    }
}

function AscensionUpgMultiplier(type) {
    let mult = new Decimal(1); 
    AscensionUpgrades.forEach((upg,id) => {
        if (game.ascensionUpgradesBought[id] === true && upg.effect && upg.type === type) {
            mult = mult.mul(upg.effect());
        }
    });
    return mult;
}

function hasAscensionUpgrade(id) {
    return game.ascensionUpgradesBought?.[id] === true;
}