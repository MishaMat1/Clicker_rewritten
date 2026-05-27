function prestigeReset() {
    game.points = new Decimal(0);
    game.pointUpgradeLevels.forEach((_, i) => {
        game.pointUpgradeLevels[i] = new Decimal(0);
    });
    if (hasAscensionMilestone(7)) {
        game.pointUpgradeLevels[3] = new Decimal(10);
    }
    else if (hasAscensionMilestone(1)) {
        game.pointUpgradeLevels[3] = new Decimal(1);
    }
}

function GetPrestigeGain(){
    let pMultiplier = getEffects("prestige", "multiplier")
    if(game.points.gte(game.prestigeRequirement)){
        let ratio = game.points.div(game.prestigeRequirement.div(10));
        let PrestigelogGain = ratio.log10()
        let FinalGain = new Decimal(PrestigelogGain).pow(1.75).mul(pMultiplier).floor();
        FinalGain = FinalGain.pow(getEffects("prestige", "exponent"));
        if (inChallenge(3)) {
            FinalGain = FinalGain.div(getEffects("prestige", "division"));
        }
        return FinalGain;
    }
}

function prestige() {
    if(inChallenge(2)) return;
    if (game.points.gte(game.prestigeRequirement)) {
        document.getElementById("prestigeTabButton").style.display = "inline-block";
        let gain = GetPrestigeGain();
        game.prestigePoints = game.prestigePoints.add(gain);
        game.prestigeResetAmount = game.prestigeResetAmount.add(1)
        prestigeReset();
        loadPrestigeUpgrades();
    }
}

function prestigeGen(diff) {
    if (!game.points.gte(game.prestigeRequirement)) return;

    let gain = GetPrestigeGain()
        .mul(0.01)
        .mul(diff);

    game.prestigePoints = game.prestigePoints.add(gain);
}

function loadPrestigeUpgrades() {
    let upgradeContainer = document.getElementById("upgradesContainer");

upgradeContainer.replaceChildren();
    upgradeContainer.appendChild(document.createTextNode("Prestige upgrades: "));
    upgradeContainer.appendChild(document.createElement("br"));
    PrestigeUpgrades.forEach((upg, index) => {
        let button = document.createElement("button");
        if(game.prestigeUpgradesBought && game.prestigeUpgradesBought[index] === true) {
            button.innerHTML = upg.name + "<br>" + upg.description + "<br>Bought";
            if(upg.effectDescription) {
            button.innerHTML += "<br>" + upg.effectDescription();
        }
            button.disabled = true;
        } else {
        button.innerHTML = upg.name + "<br>" + upg.description + "<br>" + formatNumber(upg.cost) + " PP";
        if(upg.effectDescription) {
            button.innerHTML += "<br>" + upg.effectDescription();
        }
    }
        button.onclick = function() {
            buyPrestigeUpgrade(index);
        };
        upgradeContainer.appendChild(button);
    });
let anyUnlocked = PrestigeBuyables.some(b => b.unlocked());
if(anyUnlocked) {
    upgradeContainer.appendChild(document.createElement("br"));
    upgradeContainer.appendChild(document.createTextNode("Prestige buyables: "));
    upgradeContainer.appendChild(document.createElement("br"));

PrestigeBuyables.forEach((buyable, index) => {
    if(!buyable.unlocked()) return;
    let level = game.prestigeBuyableLevels[index] || new Decimal(0);
    let button = document.createElement("button");
    const lines = [
                buyable.name,
                typeof buyable.description === "function" ? buyable.description() : buyable.description,
                "Level: " + formatNumber(game.prestigeBuyableLevels[index]),
                buyable.effectDescription ? buyable.effectDescription(index) : null,
                formatNumber(buyable.costScaling(index)) + " PP"
            ].filter(Boolean);
            button.innerHTML = lines.join("<br>");
    button.onclick = function() {
        buyPrestigeBuyable(index);
    };
    upgradeContainer.appendChild(button);
    if (hasPrestigeUpgrade(3)) {
    let maxButton = document.createElement("button");
    maxButton.innerText = "Buy Max";
    maxButton.onclick = function() {
        buyPrestigeBuyableMax(index);
    };
    upgradeContainer.appendChild(maxButton);
    upgradeContainer.appendChild(document.createElement("br"));
}});
}
}

function updatePrestigeBuyablesUI() {
    PrestigeBuyables.forEach((buyable, index) => {
        if (buyable.container) {
            const lines = [
                buyable.name,
                typeof buyable.description === "function" ? buyable.description() : buyable.description,
                "Level: " + formatNumber(game.prestigeBuyableLevels[index]),
                buyable.effectDescription ? buyable.effectDescription(index) : null,
                formatNumber(buyable.costScaling(index)) + " PP"
            ].filter(Boolean);
            buyable.container.innerHTML = lines.join("<br>");
        }
    });
}

let PrestigeUpgrades = [
    {
        id: 0,
        name: "Triple Points",
        description: "Triples your point gain.",
        type: "points",
        effectType: "multiplier",
        cost: new Decimal(1),
        permanent: false,
        effect: function() {
            return new Decimal(3);
        },
    },
    {
        id: 1,
        name: "Auto Clicker Boost",
        description: "x2.5 the effect of autoclickers.",
        type: "autoclicker",
        effectType: "multiplier",
        cost: new Decimal(3),
        permanent: false,
        effect: function() {
            return new Decimal(2.5);
        },
    },
    {
        id: 2,
        name: "Prestige buyables",
        description: "Unlock a prestige buyable",
        cost: new Decimal(5),
        permanent: false
    },
    {
        id: 3,
        name: "Some qol",
        description: "Unlocks buy max",
        cost: new Decimal(25),
        permanent: true
    },
    {
        id: 4,
        name: "Another buyable",
        description: "Unlocks another prestige buyable",
        cost: new Decimal(100),
        permanent: false
     },
     {
        id: 5,
        name: "Autoclicker boost again",
        description: "Autoclicker work at full power",
        type: "autoclicker",
        effectType: "multiplier",
        cost: new Decimal(250),
        permanent: false,
        effect: function() {
            return new Decimal(2.5);
        },
     },
     {
        id: 6,
        name: "Dynamic point boost",
        description: "Increases point gain based on your prestige points.",
        type: "points",
        effectType: "multiplier",
        cost: new Decimal(1000),
        permanent: false,
        effect: function() {
            if (hasAscensionUpgrade(6)) {
                return Decimal.max(1, game.prestigePoints.pow(0.6))
            } else {
                return Decimal.max(1, (Decimal.log(game.prestigePoints.pow(1.5), 2)));
            }
        },
        effectDescription: function() {
            return "Currently: x" + formatNumber(this.effect());
        }
     },
     {
        id: 7,
        name: "Stronger compound",
        description: "Increase compound base by 1. (base is 2)",
        type: "compound",
        effectType: "addition",
        cost: new Decimal(5000),
        permanent: false,
        effect: function() {
            return new Decimal(1)
        },
     },
     {
        id: 8,
        name: "First softcap delay",
        description: "Delays compound effect softcap by x1k",
        type: "SoftcapDelay",
        effectType: "multiplier",
        cost: new Decimal(10000),
        permanent: false,
        effect: function() {
            return new Decimal(1000)
        }
     },
     {
        id: 9,
        name: "Automation",
        description: "Unlock some automation(yay)",
        type: "unlock",
        cost: new Decimal(25000),
        permanent: true,
        effect: function() { 
            document.getElementById("automationButton").style.display = "inline-block";
            generateAutomationUI();}
     },
     {
        id: 10,
        name: "Scaled level delay",
        description: "Delay scaled level of compound by 25 (base is 25)",
        type: "ScalingDelay",
        effectType: "addition",
        cost: new Decimal(1e5),
        permanent: false,
        effect: function() {
            return new Decimal(25)
        }
     },
     {
        id: 11,
        name: "A new buyable",
        description: "Unlock a new prestige buyable!",
        cost: new Decimal(2e5),
        permanent: false
     },
     {
        id: 12,
        name: "Another one...",
        description: "Yeah another prestige buyable",
        cost: new Decimal(5e5),
        permanent: false
     },
     {
        id: 13,
        name: "A new feature.",
        description: "Unlock charge",
        cost: new Decimal(1e6),
        permanent: false,
        effect: function(){ loadPrestigeCharge() }
     },
     {
        id: 14,
        name: "Yay a buyable",
        description: "Yay a buyable",
        cost: new Decimal(1e7),
        permanent: false
     },
     {
        id: 15,
        name: "A new layer",
        description: "Unlock ascension",
        cost: new Decimal(1e8),
        permanent: true,
        effect: () => { document.getElementById("ascension-box").style.display = "block" }
     }
];

let PrestigeBuyables = [
    {
        id: 0,
        name: "Point boost",
        description: "Increases point gain by x1.5 per level.",
        type: "points",
        effectType: "multiplier",
        cost: new Decimal(1),
        level: new Decimal(0),
        ScaledLevel: new Decimal(100),
        costScaling: function() {
            let level = game.prestigeBuyableLevels[this.id] || new Decimal(0);
            let ScaledLevel = this.ScaledLevel
            if (level.lt(ScaledLevel)) {
            return new Decimal(1.5).pow(level).floor();
        }
            return new Decimal(1.75).pow(level.sub(ScaledLevel)).mul(new Decimal(1.5).pow(ScaledLevel)).floor();
    },
        effect: function() {
            return new Decimal(1.5).pow(game.prestigeBuyableLevels[this.id] || new Decimal(0));
        },
        effectDescription: function() {
            return "Currently: x" + formatNumber(this.effect());
        },
        unlocked: function() {
            return !!hasPrestigeUpgrade(2);
        },   
    },
    {
        id: 1,
        name: "Prestige boost",
        description() {
            let base = this.base.add(this.getBase())
        if(base.lt(1000)) {
            return "x" + base.toNumber().toFixed(2) + " prestige points per level"
        } else {
            return "x" + formatNumber(base) +  "prestige points per level"
        }
        },
        type: "prestige",
        effectType: "multiplier",
        cost: new Decimal(1),
        level: new Decimal(0),
        base: new Decimal(1.2),
        getBase() {
            let BaseAddition;
            return BaseAddition = getEffects("prestige-buyable-base", "addition");
        },
        ScaledLevel: new Decimal(100),
        costScaling: function() {
            let level = game.prestigeBuyableLevels[this.id] || new Decimal(0);
            let ScaledLevel = this.ScaledLevel
            if (level.lt(ScaledLevel)) {
            return new Decimal(1.5).pow(level).floor();
        }
            return new Decimal(1.75).pow(level.sub(ScaledLevel)).mul(new Decimal(1.5).pow(ScaledLevel)).floor();
        },
        effect: function() {
            let base;
            base = this.base.add(this.getBase())
            return new Decimal(base).pow(game.prestigeBuyableLevels[this.id] || new Decimal(0));
        },
        effectDescription: function() {
            return "Currently: x" + formatNumber(this.effect());
        },
        unlocked: function() {
            return !!hasPrestigeUpgrade(4);
        },   
    },
    {
        id: 2,
        name: "Softcap delay",
        description: "Delays compound softcap by x10",
        type: "SoftcapDelay",
        effectType: "multiplier",
        cost: new Decimal(10000),
        level: new Decimal(0),
        ScaledLevel: new Decimal(50),
        costScaling: function() {
            let level = game.prestigeBuyableLevels[this.id] || new Decimal(0);
            let ScaledLevel = this.ScaledLevel
            if(level.lt(ScaledLevel)) {
                return this.cost.mul(new Decimal(1.5).pow(level));
            }
                return this.cost.mul(new Decimal(2).pow(level.sub(ScaledLevel)).mul(new Decimal(1.5).pow(ScaledLevel)))
        },
        effect: function() {
            return new Decimal(10).pow(game.prestigeBuyableLevels[this.id] || new Decimal(0))
        },
        effectDescription: function () {
            return "Currently: x" + formatNumber(this.effect()) + " later";
        },
        unlocked: () => {return !!hasPrestigeUpgrade(11)}
    },
    {
        id: 3,
        name: "Compound effect",
        description: "Increase compound effect by +0.1",
        type: "compound",
        effectType: "addition",
        cost: new Decimal(1e5),
        level: new Decimal(0),
        ScaledLevel: new Decimal(25),
        costScaling: function() {
            let level = game.prestigeBuyableLevels[this.id] || new Decimal(0);
            let ScaledLevel = this.ScaledLevel
            if(level.lt(ScaledLevel)) {
                return this.cost.mul(new Decimal(3).pow(level));
            }
                return this.cost.mul(new Decimal(5).pow(level.sub(ScaledLevel)).mul(new Decimal(3).pow(ScaledLevel)))
        },
        effect: function() {
            return new Decimal(0.1).mul(game.prestigeBuyableLevels[this.id] || new Decimal(0))
        },
        effectDescription: function () {
           let eff = this.effect()
        if(eff.lt(1000)) {
            return "Currently: +" + eff.toNumber().toFixed(1)
        } else {
            return "Currently: +" + formatNumber(eff)
        }
        },
        unlocked: () => {return !!hasPrestigeUpgrade(12)}
    },
    {
        id: 4,
        name: "More charge",
        description: "Double charge gain per lvl",
        type: "charge",
        effectType: "multiplier",
        cost: new Decimal(1e6),
        level: new Decimal(0),
        ScaledLevel: new Decimal(25),
        costScaling: function() {
            let level = game.prestigeBuyableLevels[this.id] || new Decimal(0);
            let ScaledLevel = this.ScaledLevel
            if(level.lt(this.ScaledLevel)) {
                return this.cost.mul(new Decimal(10).pow(level))
            } 
                return this.cost.mul(new Decimal(20).pow(level.sub(ScaledLevel)).mul(new Decimal(10).pow(ScaledLevel)))
        },
        effect: function() {
            return new Decimal(2).pow(game.prestigeBuyableLevels[this.id] || new Decimal(0))
        },
        effectDescription: function() {
            return "Currently x" + formatNumber(this.effect())
        },
        unlocked() {return !!hasPrestigeUpgrade(14)}
    }
]

function buyPrestigeUpgrade(id) {
    let upg = PrestigeUpgrades[id];
    if(game.prestigePoints.gte(upg.cost) && game.prestigeUpgradesBought[id] === false) {
        game.prestigePoints = game.prestigePoints.sub(upg.cost);
        game.prestigeUpgradesBought[id] = true;
        if(upg.effect) upg.effect();
        loadPrestigeUpgrades();
        renderPointUpgrades();
    }
}

function buyPrestigeBuyable(id) {
    let buyable = PrestigeBuyables[id]
    if (!buyable.unlocked()) return;
    let cost = buyable.costScaling()
    if(game.prestigePoints.gte(cost)) {
        game.prestigePoints = game.prestigePoints.sub(cost)
        game.prestigeBuyableLevels[id] = game.prestigeBuyableLevels[id].add(1)
        if(buyable.effect) buyable.effect();
        loadPrestigeUpgrades();
        renderPointUpgrades();
    }
}

function buyPrestigeBuyableMax(index) {
    let buyable = PrestigeBuyables[index];
    if (!buyable.unlocked()) return;
    let prestigePoints = game.prestigePoints;
    while (true) {
        let cost = buyable.costScaling();
        if (prestigePoints.lt(cost)) break;
        let bulk = 1;
        let totalCost = new Decimal(0);
        for (let i = 0; i < bulk; i++) {
            let c = buyable.costScaling();
            if (prestigePoints.lt(totalCost.add(c))) break;
            totalCost = totalCost.add(c);
            game.prestigeBuyableLevels[index] = game.prestigeBuyableLevels[index].add(1);
            bulk *= 2
        }

        if (totalCost.eq(0)) break;

        prestigePoints = prestigePoints.sub(totalCost);
    }
    game.prestigePoints = prestigePoints
    renderPointUpgrades();
    loadPrestigeUpgrades();
    }


function hasPrestigeUpgrade(id) {
    return game.prestigeUpgradesBought?.[id] === true;
}