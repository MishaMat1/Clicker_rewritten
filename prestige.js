function prestigeReset() {
    game.points = new Decimal(0);
    game.pointUpgradeLevels.forEach((_, i) => {
        game.pointUpgradeLevels[i] = new Decimal(0);
    });
    if (hasAscensionMilestone(1)) {
        game.pointUpgradeLevels[3] = new Decimal(1);
    }
}

function GetPrestigeGain(){
    const prestigeMUltipliers = [PrestigeUpgBuyMultiplier("prestige"), ChargeMulti("prestige"), 
        AscensionMulti("prestige"), AscensionUpgMultiplier("prestige")]
    let TotalPrestigeMulti = new Decimal(1)
    let pMultiplier = prestigeMUltipliers.reduce((total, multi) => total.mul(multi), TotalPrestigeMulti)
    if(game.points.gte(game.prestigeRequirement)){
        let ratio = game.points.div(game.prestigeRequirement.div(10));
        let PrestigelogGain = ratio.log10()
        return new Decimal(PrestigelogGain).pow(1.75).mul(pMultiplier).floor();
    }
}

function prestige() {
    if (game.points.gte(game.prestigeRequirement)) {
        document.getElementById("prestigeTabButton").style.display = "inline-block";
        let gain = GetPrestigeGain();
        game.prestigePoints = game.prestigePoints.add(gain);
        game.prestigeResetAmount = game.prestigeResetAmount.add(1)
        prestigeReset();
        loadPrestigeUpgrades();
    }
}

function loadPrestigeUpgrades() {
    let upgradeContainer = document.getElementById("upgradesContainer");

upgradeContainer.replaceChildren();
    upgradeContainer.appendChild(document.createTextNode("Prestige: " + formatNumber(game.prestigePoints)));
    upgradeContainer.appendChild(document.createElement("br"));
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
    let level = game.prestigeBuyableLevels[index] || 0;
    let button = document.createElement("button");
    button.innerHTML =
        buyable.name + "<br>" +
        buyable.description + "<br>" +
        "Level: " + level + "<br>" +
        buyable.effectDescription() + "<br>" +
        formatNumber(buyable.costScaling()) + " PP";
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

let PrestigeUpgrades = [
    {
        id: 0,
        name: "Triple Points",
        description: "Triples your point gain.",
        type: "points",
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
        cost: new Decimal(3),
        permanent: false,
        effect: function() {
            return new Decimal(2.5);
        },
    },
    {
        id: 2,
        name: "Unlock Prestige Buyables",
        description: "Unlock prestige buyables.",
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
        cost: new Decimal(1000),
        permanent: false,
        effect: function() {
            if (hasAscensionUpgrade(6)) {
                return game.prestigePoints.pow(0.6)
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
        permanent() { if(!hasAscensionMilestone(3)) return true; 
            else return false },
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
        description: "Increases prestige point gain by x1.2 per level.",
        type: "prestige",
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
            return new Decimal(1.2).pow(game.prestigeBuyableLevels[this.id] || new Decimal(0));
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
            return "Currently: x" + formatNumber(this.effect())
        },
        unlocked: () => {return !!hasPrestigeUpgrade(11)}
    },
    {
        id: 3,
        name: "Compound effect",
        description: "Increase compound effect by +0.1",
        type: "compound",
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

function PrestigeUpgBuyMultiplier(type) {
    let mult = new Decimal(1);
    PrestigeUpgrades.forEach((upg,id) => {
        if (game.prestigeUpgradesBought && game.prestigeUpgradesBought[id] === true && upg.effect && upg.type === type) {
            mult = mult.mul(upg.effect());
        }
    });
    PrestigeBuyables.forEach(buyable => {
        if (buyable.unlocked() && buyable.type === type) {
            mult = mult.mul(buyable.effect());
        }
    });
    return mult;
}

function PrestigeUpgBuyAddition(type) {
    let add = new Decimal(0); 
    PrestigeUpgrades.forEach((upg,id) => {
        if (game.prestigeUpgradesBought && game.prestigeUpgradesBought[id] === true  && upg.effect && upg.type === type) {
            add = add.add(upg.effect());
        }
    });
    PrestigeBuyables.forEach(buyable => {
        if (buyable.unlocked() && buyable.type === type) {
            add = add.add(buyable.effect());
        }
    });
    return add;
}

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
    let upg = PrestigeBuyables[index];
    let prestigePoints = game.prestigePoints;
    while (true) {
        let cost = upg.costScaling();
        if (prestigePoints.lt(cost)) break;
        let bulk = 1;
        let totalCost = new Decimal(0);
        for (let i = 0; i < bulk; i++) {
            let c = upg.costScaling();
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