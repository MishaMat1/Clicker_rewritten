function prestigeReset() {
    game.points = new Decimal(0);
    PointUpgrades.forEach(upg => upg.level = new Decimal(0));
}

function GetPrestigeGain(){
    if(game.points.gte(game.prestigeRequirement)){
        let ratio = game.points.div(game.prestigeRequirement.div(10));
        let PrestigelogGain = ratio.log10()
        return new Decimal(PrestigelogGain).pow(1.75).mul(PrestigeUpgBuyMultiplier("prestige")).floor();
    }
}

function prestige() {
    if (game.points.gte(game.prestigeRequirement)) {
        document.getElementById("prestigeTabButton").style.display = "inline-block";
        let gain = GetPrestigeGain();
        game.prestigePoints = game.prestigePoints.add(gain);
        prestigeReset();
        loadPrestigeUpgrades();
        renderPointUpgrades();
    }
}

let PrestigeUpgrades = [
    {
        id: 0,
        name: "Triple Points",
        description: "Triples your point gain.",
        type: "points",
        cost: new Decimal(1),
        bought: false,
        effect: function() {
            return new Decimal(3);
        },
    },
    {
        id: 1,
        name: "Auto Clicker Boost",
        description: "Doubles the effect of autoclickers.",
        type: "autoclicker",
        cost: new Decimal(3),
        bought: false,
        effect: function() {
            return new Decimal(2);
        },
    },
    {
        id: 2,
        name: "Unlock Prestige Buyables",
        description: "Unlock prestige buyables.",
        cost: new Decimal(5),
        bought: false
    },
    {
        id: 3,
        name: "Some qol",
        description: "Unlocks buy max",
        cost: new Decimal(25),
        bought: false,
    },
    {
        id: 4,
        name: "Another buyable",
        description: "Unlocks another prestige buyable",
        cost: new Decimal(100),
        bought: false,
     },
     {
        id: 5,
        name: "Autoclicker boost again",
        description: "Autoclicker work at full power",
        type: "autoclicker",
        cost: new Decimal(250),
        bought: false,
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
        bought: false,
        effect: function() {
            return Decimal.max(1, (Decimal.log(game.prestigePoints.pow(1.5), 2)));
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
        bought: false,
        effect: function() {
            return new Decimal(1)
        },
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
        costScaling: function() {
            if (this.level.lte(25)) {
            return new Decimal(1.5).pow(this.level).floor();
        }
        return new Decimal(1.75).pow(this.level.sub(25)).mul(new Decimal(1.5).pow(25)).floor();
    },
        effect: function() {
            return new Decimal(1.5).pow(this.level);
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
        description: "Increases prestige point gain by x1.1 per level.",
        type: "prestige",
        cost: new Decimal(50),
        level: new Decimal(0),
        costScaling: function() {
            if (this.level.lte(25)) {
            return new Decimal(1.5).pow(this.level).floor();
        }
            return new Decimal(1.75).pow(this.level.sub(25)).mul(new Decimal(1.5).pow(25)).floor();
        },
        effect: function() {
            return new Decimal(1.1).pow(this.level);
        },
        effectDescription: function() {
            return "Currently: x" + formatNumber(this.effect());
        },
        unlocked: function() {
            return !!hasPrestigeUpgrade(4);
        },   
    }
]

function PrestigeUpgBuyMultiplier(type) {
    let mult = new Decimal(1); 
    // Apply upgrades
    PrestigeUpgrades.forEach(upg => {
        if (upg.bought && upg.effect && upg.type === type) {
            mult = mult.mul(upg.effect());
        }
    });
    // Apply buyables
    PrestigeBuyables.forEach(buyable => {
        if (buyable.unlocked() && buyable.type === type) {
            mult = mult.mul(buyable.effect());
        }
    });
    return mult;
}
 
function loadPrestigeUpgrades()
{
    let tab = document.getElementById("prestigeTab");
    tab.innerHTML = "";
    tab.appendChild(document.createTextNode("Prestige: " + formatNumber(game.prestigePoints)));
    tab.appendChild(document.createElement("br"));
    tab.appendChild(document.createTextNode("Prestige upgrades: "));
    tab.appendChild(document.createElement("br"));
    PrestigeUpgrades.forEach((upg, index) => {
        let button = document.createElement("button");
        if(upg.bought) {
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
        tab.appendChild(button);
    });
let anyUnlocked = PrestigeBuyables.some(b => b.unlocked());
if(anyUnlocked) {
    tab.appendChild(document.createElement("br"));
    tab.appendChild(document.createTextNode("Prestige buyables: "));
    tab.appendChild(document.createElement("br"));

PrestigeBuyables.forEach((buyable, index) => {
    if(!buyable.unlocked()) return;
    let button = document.createElement("button");
    button.innerHTML =
        buyable.name + "<br>" +
        buyable.description + "<br>" +
        "Level: " + buyable.level + "<br>" +
        buyable.effectDescription() + "<br>" +
        formatNumber(buyable.costScaling()) + " PP";
    button.onclick = function() {
        buyPrestigeBuyable(index);
    };
    tab.appendChild(button);
    tab.appendChild(document.createElement("br"));
});
}
}

function buyPrestigeUpgrade(id) {
    let upg = PrestigeUpgrades[id];
    if(game.prestigePoints.gte(upg.cost) && !upg.bought) {
        game.prestigePoints = game.prestigePoints.sub(upg.cost);
        upg.bought = true;
        if(upg.effect) upg.effect();
        loadPrestigeUpgrades();
        renderPointUpgrades();
    }
}

function buyPrestigeBuyable(index) {
    let buyable = PrestigeBuyables[index]
    let cost = buyable.costScaling()
    if(game.prestigePoints.gte(cost)) {
        game.prestigePoints = game.prestigePoints.sub(cost)
        buyable.level = buyable.level.add(1)
        if(buyable.effect) buyable.effect();
        loadPrestigeUpgrades() // refresh tab
    }
}

function hasPrestigeUpgrade(id) {
    return !!PrestigeUpgrades.find(u => u.id === id)?.bought
}