function ascendReset() {
    game.points = new Decimal(0)
    game.prestigePoints = new Decimal(0)
    game.charge = new Decimal(0)
    if(hasAscensionMilestone(3)) {
        game.pointAuto.level = new Decimal(10)
    } else game.pointAuto.level = new Decimal(0)
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
        return new Decimal(AscendLogGain).pow(1.25).floor();
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