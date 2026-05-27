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
    if(hasAscensionMilestone(7)) {
        game.pointUpgradeLevels[3] = new Decimal(10);
    }
    if(!hasAscensionMilestone(6)) {
   game.prestigeUpgradesBought = game.prestigeUpgradesBought.map((bought, i) => {
    return PrestigeUpgrades[i] && PrestigeUpgrades[i].permanent ? bought : false;
   });
   if(hasAscensionMilestone(3)) {
    game.prestigeUpgradesBought[13] = true;
   }
}
    game.prestigeBuyableLevels.forEach((_, i) => {
        game.prestigeBuyableLevels[i] = new Decimal(0);
    });
    game.chargeMilestones = game.chargeMilestones.map(() => false);
    game.prestigeResetAmount = new Decimal(0)
    }

function GetAscensionGain(){
    if(game.prestigePoints.gte(game.ascendRequirement)){
        let AscendGain = game.prestigePoints.div(game.ascendRequirement).pow(0.4).floor();
            AscendGain = AscendGain.mul(getEffects("ascension", "multiplier"));
            AscendGain = AscendGain.mul(getChallengeAscensionMultiplier());
        return new Decimal(AscendGain)
    }
}

function ascend() {
    if (game.prestigePoints.gte(game.ascendRequirement)) {
        document.getElementById("ascendTabButton").style.display = "inline-block";
        let gain = GetAscensionGain();
        game.ascensionPoints = game.ascensionPoints.add(gain);
        game.TotalAscensionPoints = game.TotalAscensionPoints.add(gain)
        game.ascensionResetAmount = game.ascensionResetAmount.add(new Decimal(1).mul(getEffects("ascension-reset", "multiplier")));

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
        effectType: "multiplier",
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
        effectType: "multiplier",
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
        effectType: "multiplier",
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
        effectType: "multiplier",
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
        formula: new Decimal(0.7),
        type: "points",
        effectType: "multiplier",
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
        formula: new Decimal(0.6),
        type: "prestige",
        effectType: "multiplier",
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
    },
    {
        id: 7,
        name: "More ascension resets",
        description: "x3 ascension resets",
        type: "ascension-reset",
        effectType: "multiplier",
        cost: new Decimal(100),
        permament: false,
        effect() {
            return new Decimal(3)
        }
    },
    {
        id: 8,
        name: "More prestige!",
        description: "add +0.05 to base of the 2nd prestige buyable",
        type: "prestige-buyable-base",
        effectType: "addition",
        cost: new Decimal(250),
        permament: false,
        effect() {
            return new Decimal(0.05)
        }
    },
    {
        id: 9,
        name: "Just more charge",
        description: "x5 charge",
        type: "charge",
        effectType: "multiplier",
        cost: new Decimal(500),
        permament: false,
        effect() {
            return new Decimal(5)
        }
    },
    {
        id: 10,
        name: "Challenging",
        description: "Unlock challenges",
        type: "unlock",
        cost: new Decimal(1000),
        permament: true,
        effect() {
            document.getElementById("AscChallenges").style.display = "inline-block";
            loadAscensionChallenges();
        }
    },
    {
        id: 11,
        name: "Useful multipliers",
        description: "Compound multiplies multiplier base at an extremely reduced rate",
        type: "upgrade-power",
        effectType: "multiplier",
        cost: new Decimal(5e8),
        permament: false,
        effect() {
            let effect = PointUpgrades[2].effect(2)
            return Decimal.log(effect.add(1), 10)
        }
    },
    {
        id: 12,
        name: "To infinity and beyond!",
        description: "Raise points by ^1.01",
        type: "points",
        effectType: "exponent",
        cost: new Decimal(1e9),
        permament: false,
        effect() {
            return new Decimal(1.01)
        }
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

function hasAscensionUpgrade(id) {
    return game.ascensionUpgradesBought?.[id] === true;
}