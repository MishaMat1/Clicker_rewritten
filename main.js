let lastUpdate = Date.now();

function gameLoop() {
    const now = Date.now();
    const diff = (now - lastUpdate) / 1000;
    lastUpdate = now;

    game.pointAuto.timer += diff;

let interval = getPointAutoInterval();

if (game.pointAuto.enabled && game.pointAuto.timer >= interval) {
    game.pointAuto.timer = 0;

    for (let i = 0; i < PointUpgrades.length; i++) {
        buyPointUpgradeMax(i);
    }
}

    Idle(diff);
    if(hasPrestigeUpgrade(13)) {
        chargeGen(diff);
    }
    updateChargeMilestones();
    updateAscensionMilestones();
    updateEffectDescription();
    updateUI();
}

setInterval(gameLoop, 50);

const suffixes = ["K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","Dc"];

function formatNumber(decimal) {
    decimal = new Decimal(decimal); // ensure it's a Decimal

    if(decimal.lt(1000)) return decimal.toFixed(0);

    // calculate tier from the Decimal exponent (base-10)
    // `decimal.e` is the base-10 exponent (e.g. 1000 -> 3), so tier = floor(e/3)-1
    let exponent = decimal.e; // small integer
    let tier = Math.floor(exponent / 3) - 1;

    if(tier >= suffixes.length) return decimal.toExponential(2).replace("e+", "e");

    let scale = new Decimal(10).pow((tier + 1) * 3);
    let scaled = decimal.div(scale);
    let formatted = scaled.toFixed(2).replace(/\.?0+$/,'');

    return formatted + suffixes[tier];
}

function getTotalPointMultiplier() {
    const multipliers = [PointMultiplier("points"), PrestigeUpgBuyMultiplier("points"), 
        ChargeMulti("points"), AscensionUpgMultiplier("points"),  AscensionMulti("points")];
    let TotalPointMultiplier = new Decimal(1);
    return multipliers.reduce((total, multiplier) => total.mul(multiplier), TotalPointMultiplier);
}

function pointClick(){
    game.points = game.points.add(getTotalPointMultiplier());
}

let PointUpgrades = [
    {
        name: "Click Power",
        description: "+1 per click per level",
        baseCost: new Decimal(10),
        costScaling: new Decimal(1.25),
        ScaledLevel: new Decimal(100),
        SuperScaledLevel: new Decimal(250),
        type: "points",
        category: "click",
        getCost: function(index) {
            let level = game.pointUpgradeLevels[index];
            let scaled = this.ScaledLevel;
            let superScaled = this.SuperScaledLevel;

            let cost;
            if (level.lt(scaled)) {
                cost = this.baseCost.mul(this.costScaling.pow(level));

            } else if (level.lt(superScaled)) {
                let startCost = this.baseCost.mul(this.costScaling.pow(scaled));
                cost = startCost.mul(new Decimal(1.5).pow(level.sub(scaled)));

            } else {
                let startCost = this.baseCost
                    .mul(this.costScaling.pow(scaled))
                    .mul(new Decimal(1.5).pow(superScaled.sub(scaled)));
                cost = startCost.mul(new Decimal(2).pow(level.sub(superScaled)));
            }

            return cost;
        },

        effect: function(index) {
            return new Decimal(1).add(game.pointUpgradeLevels[index]);
        },
        effectDescription: function(index) {
            return "Currently: +" + formatNumber(this.effect(index)) + " per click";
        }
    },

    {
        name: "Multiplier",
        description: "+ x1 to point multiplier per level",
        baseCost: new Decimal(50),
        costScaling: new Decimal(1.5),
        ScaledLevel: new Decimal(100),
        SuperScaledLevel: new Decimal(250),
        type: "points",
        category: "multiplier",
        getCost: function(index) {
            let level = game.pointUpgradeLevels[index];
            let scaled = this.ScaledLevel;
            let superScaled = this.SuperScaledLevel;

            let cost;
            if (level.lt(scaled)) {
                cost = this.baseCost.mul(this.costScaling.pow(level));

            } else if (level.lt(superScaled)) {
                let startCost = this.baseCost.mul(this.costScaling.pow(scaled));
                cost = startCost.mul(new Decimal(2).pow(level.sub(scaled)));

            } else {
                let startCost = this.baseCost
                    .mul(this.costScaling.pow(scaled))
                    .mul(new Decimal(2).pow(superScaled.sub(scaled)));
                cost = startCost.mul(new Decimal(2.5).pow(level.sub(superScaled)));
            }

            return cost;
        },

        effect: function(index) {
            return new Decimal(1).add(game.pointUpgradeLevels[index]);
        },
        effectDescription: function(index) {
            return "Currently: x" + formatNumber(this.effect(index)) + " to points";
        }
    },

    {
        name: "Compound",
        description: function() {
            let base = this.base.add(this.getBase())
        if(base.lt(1000)) {
            return "x" + base.toNumber().toFixed(2) + " points per level"
        } else {
            return "x" + formatNumber(base) + " points per level"
        }
        },
        baseCost: new Decimal(1000),
        costScaling: new Decimal(3),
        base: new Decimal(2),
        getBase() {
            const BaseAdd = [PrestigeUpgBuyAddition("compound"), ChargeAdd("compound")]
            let TotalBase = new Decimal(1)
            return BaseAdd.reduce((total, add) => total.add(add), TotalBase).sub(1)
        },
        ScaledLevel: new Decimal(25),
        SuperScaledLevel: new Decimal(100),
        softcapStart: new Decimal(1e27),
        strenght: new Decimal(0.5),
        type: "points",
        category: "compound",
        getCost: function(index) {
            let level = game.pointUpgradeLevels[index];
            let scaled = this.ScaledLevel.add(PrestigeUpgBuyMultiplier("ScalingDelay"));
            let superScaled = this.SuperScaledLevel;

            let cost;
            if (level.lt(scaled)) {
                cost = this.baseCost.mul(this.costScaling.pow(level));

            } else if (level.lt(superScaled)) {
                let startCost = this.baseCost.mul(this.costScaling.pow(scaled));
                cost = startCost.mul(new Decimal(5).pow(level.sub(scaled)));

            } else {
                let startCost = this.baseCost
                    .mul(this.costScaling.pow(scaled))
                    .mul(new Decimal(5).pow(superScaled.sub(scaled)));
                cost = startCost.mul(new Decimal(7.5).pow(level.sub(superScaled)));
            }

            return cost;
        },

        effect: function(index) {
            let base;
            let strenght = this.strenght;
            let softcapStart = this.softcapStart.mul(PrestigeUpgBuyMultiplier("SoftcapDelay").add(1));
            base = this.base.add(this.getBase())
            let value = base.pow(game.pointUpgradeLevels[index]);
            let cap = softcapStart;
            if (value.gt(cap)) {
                value = value.div(cap).pow(strenght).mul(cap);
            }
            return value;
        },
        effectDescription: function(index) {
        let base = this.base.add(this.getBase())
        let uncapped = base.pow(game.pointUpgradeLevels[index]);
        let softcapStart = this.softcapStart.mul(PrestigeUpgBuyMultiplier("SoftcapDelay").add(1));
        let cap = softcapStart;

            let text = "Currently: x" + formatNumber(this.effect(index));

            if (uncapped.gt(cap)) {
                text += " (softcapped)";
            }
            return text;
        },
    },

    {
        name: "Autoclicker",
        description: function() {
            if (hasPrestigeUpgrade(5)){
                return "1 autoclicker = 1 cps"
            } else if (hasPrestigeUpgrade(1)){
                return "1 autoclciker = 0.5 cps"
            } else {
                return "1 autoclicker = 0.2 cps"
            }
        },
        baseCost: new Decimal(100),
        costScaling: new Decimal(3),
        ScaledLevel: new Decimal(100),
        SuperScaledLevel: new Decimal(1000),
        type: "autoclicker",
        category: "autoclicker",
        getCost: function(index) {
            let level = game.pointUpgradeLevels[index];
            let scaled = this.ScaledLevel;
            let superScaled = this.SuperScaledLevel;

            let cost;
            if (level.lt(scaled)) {
                cost = this.baseCost.mul(this.costScaling.pow(level));

            } else if (level.lt(superScaled)) {
                let startCost = this.baseCost.mul(this.costScaling.pow(scaled));
                cost = startCost.mul(new Decimal(5).pow(level.sub(scaled)));

            } else {
                let startCost = this.baseCost
                    .mul(this.costScaling.pow(scaled))
                    .mul(new Decimal(5).pow(superScaled.sub(scaled)));
                cost = startCost.mul(new Decimal(10).pow(level.sub(superScaled)));
            }

            return cost;
        },

        effect: function(index) {
            return new Decimal(0).add(game.pointUpgradeLevels[index]);
        },
        effectDescription: function(index) {
            return "Currently: " + formatNumber(this.effect(index)) + " autoclickers";
        }
    }
];

function buyPointUpgrade(index) {
    let upg = PointUpgrades[index];
    let cost = upg.getCost(index);
    if (game.points.gte(cost)) {
        game.points = game.points.sub(cost);
        game.pointUpgradeLevels[index] = game.pointUpgradeLevels[index].add(1);
        upg.effect(index);
    }
}

function buyPointUpgradeMax(index) {
    let upg = PointUpgrades[index];

    let points = game.points;

    while (true) {

        let cost = upg.getCost(index);
        if (points.lt(cost)) break;

        let bulk = 1;

        let totalCost = new Decimal(0);

        for (let i = 0; i < bulk; i++) {
            let c = upg.getCost(index);
            if (points.lt(totalCost.add(c))) break;

            totalCost = totalCost.add(c);
            game.pointUpgradeLevels[index] = game.pointUpgradeLevels[index].add(1);
            bulk *= 2
        }

        if (totalCost.eq(0)) break;

        points = points.sub(totalCost);
    }
    game.points = points
}

function PointMultiplier(type) {
    let mult = new Decimal(1); 
    PointUpgrades.forEach((upg, index) => {

        let level = game.pointUpgradeLevels[index];

        if (level.gt(0) && upg.type === type) {
            mult = mult.mul(upg.effect(index));
        }
    });
    return mult;
}

function renderPointUpgrades() {
    document.getElementById("clickUpgrades").replaceChildren();
    document.getElementById("multiplierUpgrades").replaceChildren();
    document.getElementById("compoundUpgrades").replaceChildren();
    document.getElementById("autoclickerUpgrades").replaceChildren();

    PointUpgrades.forEach((upg, index) => {
        let button = document.createElement("button");
        button.id = `point-upgrade-${index}`
        upg.container = button;
const lines = [
    upg.name,
    typeof upg.description === "function" ? upg.description() : upg.description,
    "Level: " + formatNumber(game.pointUpgradeLevels[index]),
    upg.effectDescription ? upg.effectDescription(index) : null,
    formatNumber(upg.getCost(index)) + " Points"
].filter(Boolean);

button.innerHTML = lines.join("<br>");

        button.onclick = function() {
            buyPointUpgrade(index);
        };

        if (upg.category === "click") {
            document.getElementById("clickUpgrades").appendChild(button);
        }
        if (upg.category === "multiplier") {
            document.getElementById("multiplierUpgrades").appendChild(button);
        }
        if (upg.category === "compound") {
            document.getElementById("compoundUpgrades").appendChild(button);
        }
        if (upg.category === "autoclicker") {
            document.getElementById("autoclickerUpgrades").appendChild(button);
        }
        if (hasPrestigeUpgrade(3)) {
    let maxButton = document.createElement("button");
    maxButton.innerText = "Buy Max";
    maxButton.onclick = function() {
        buyPointUpgradeMax(index);
    };
    document.getElementById(upg.category + "Upgrades").appendChild(maxButton);
}
    });
}

function updatePointUpgradesUI() {
    PointUpgrades.forEach((upg, index) => {
        if (upg.container) {
            const lines = [
                upg.name,
                typeof upg.description === "function" ? upg.description() : upg.description,
                "Level: " + formatNumber(game.pointUpgradeLevels[index]),
                upg.effectDescription ? upg.effectDescription(index) : null,
                formatNumber(upg.getCost(index)) + " Points"
            ].filter(Boolean);
            upg.container.innerHTML = lines.join("<br>");
        }
    });
}

function Idle(diff){
    let pointsFromAutoclickers = PointUpgrades[3].effect(3)
    .mul(getTotalPointMultiplier())
    .mul((diff / 5)*(PrestigeUpgBuyMultiplier("autoclicker")));
    game.points = game.points.add(pointsFromAutoclickers);
}