let lastUpdate = Date.now();

function gameLoop() {
    const now = Date.now();
    const diff = (now - lastUpdate) / 1000;
    lastUpdate = now;

    game.pointAuto.timer += diff;
    game.prestigeAuto.timer += diff;

    let PointInterval = getPointAutoInterval();
    let PrestigeInterval = getPrestigeAutoInterval();

    if (game.pointAuto.enabled && game.pointAuto.timer >= PointInterval && !inChallenge(1)) {
        game.pointAuto.timer = 0;
        for (let i = 0; i < PointUpgrades.length; i++) {
            buyPointUpgradeMax(i);
        }
    }
    if (game.prestigeAuto.enabled && game.prestigeAuto.timer >= PrestigeInterval) {
        game.prestigeAuto.timer = 0;

        for (let i = 0; i < PrestigeBuyables.length; i++) {
            buyPrestigeBuyableMax(i);
        }
    }

    Idle(diff);
    if (hasPrestigeUpgrade(13)) {
        chargeGen(diff);
    }

    if (hasAscensionMilestone(8) && !inChallenge(2)) {
        prestigeGen(diff);
    }

    updateUI();
}

setInterval(gameLoop, 50);

const suffixes = ["K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];

function formatNumber(decimal) {
    decimal = new Decimal(decimal); // ensure it's a Decimal

    if (decimal.lt(1000)) return decimal.toFixed(0);

    // calculate tier from the Decimal exponent (base-10)
    // `decimal.e` is the base-10 exponent (e.g. 1000 -> 3), so tier = floor(e/3)-1
    let exponent = decimal.e; // small integer
    let tier = Math.floor(exponent / 3) - 1;

    if (tier >= suffixes.length) return decimal.toExponential(2).replace("e+", "e");

    let scale = new Decimal(10).pow((tier + 1) * 3);
    let scaled = decimal.div(scale);
    let formatted = scaled.toFixed(2).replace(/\.?0+$/, '');

    return formatted + suffixes[tier];
}

function getTotalPointMultiplier() {
    let mult = Decimal.max(new Decimal(1), getEffects("points", "addition"));
    mult = mult.mul(getEffects("points", "multiplier"));
    mult = mult.pow(getEffects("points", "exponent"));
    if (inChallenge(0)) {
        mult = mult.pow(0.5);
    }
    if (inChallenge(3)) {
        mult = mult.div(getEffects("points", "division"));
    }
    mult = softcap(mult, "1e500", 0.8);
    mult = softcap(mult, "1e700", 0.7);
    mult = softcap(mult, "1e900", 0.6);
    return mult;
}

function softcap(value, start, power) {
    if (value.lte(start)) return value;

    return value.div(start).pow(power).mul(start);
}

function pointClick() {
    if (game.points.gte(game.the_limit)) return;
    game.points = game.points.add(getTotalPointMultiplier());
}

let PointUpgrades = [
    {
        name: "Click Power",
        description: function () {
            let base = new Decimal(1).mul(getEffects("upgrade-boost", "multiplier"))
            return "+" + formatNumber(base) + " points per click"
        },
        baseCost: new Decimal(10),
        costScaling: new Decimal(1.25),
        ScaledLevel: new Decimal(100),
        SuperScaledLevel: new Decimal(250),
        type: "points",
        effectType: "addition",
        category: "click",
        challengeCounted: true,
        getCost: function (index) {
            let level = game.pointUpgradeLevels[index];
            let scaled = this.ScaledLevel;
            let superScaled = this.SuperScaledLevel;
            let reduction = getEffects("point-upgrade", "reduction");
            let costScaling = this.costScaling.sub(reduction);
            costScaling = Decimal.max(1.01, costScaling);
            let cost;
            if (level.lt(scaled)) {
                cost = this.baseCost.mul(costScaling.pow(level));

            } else if (level.lt(superScaled)) {
                let startCost = this.baseCost.mul(costScaling.pow(scaled));
                cost = startCost.mul(new Decimal(1.5).pow(level.sub(scaled)));

            } else {
                let startCost = this.baseCost
                    .mul(costScaling.pow(scaled))
                    .mul(new Decimal(1.5).pow(superScaled.sub(scaled)));
                cost = startCost.mul(new Decimal(2).pow(level.sub(superScaled)));
            }

            return cost;
        },

        effect: function (index) {
            return new Decimal(1).add(game.pointUpgradeLevels[index]).mul(getEffects("upgrade-boost", "multiplier"));
        },
        effectDescription: function (index) {
            return "Currently: +" + formatNumber(this.effect(index)) + " per click";
        }
    },

    {
        name: "Multiplier",
        description: function () {
            let base = getEffects("upgrade-power", "multiplier", this)
            if (base.lt(1000)) {
                return "+ x" + base.toNumber().toFixed(2) + " points per level"
            } else {
                return "+ x" + formatNumber(base) + " points per level"
            }
        },
        baseCost: new Decimal(50),
        costScaling: new Decimal(1.5),
        ScaledLevel: new Decimal(100),
        SuperScaledLevel: new Decimal(250),
        type: "points",
        effectType: "multiplier",
        category: "multiplier",
        challengeCounted: true,
        getCost: function (index) {
            let level = game.pointUpgradeLevels[index];
            let scaled = this.ScaledLevel;
            let superScaled = this.SuperScaledLevel;
            let reduction = getEffects("point-upgrade", "reduction");
            let costScaling = this.costScaling.sub(reduction);
            costScaling = Decimal.max(1.01, costScaling);
            let cost;
            if (level.lt(scaled)) {
                cost = this.baseCost.mul(costScaling.pow(level));

            } else if (level.lt(superScaled)) {
                let startCost = this.baseCost.mul(costScaling.pow(scaled));
                cost = startCost.mul(new Decimal(2).pow(level.sub(scaled)));

            } else {
                let startCost = this.baseCost
                    .mul(costScaling.pow(scaled))
                    .mul(new Decimal(2).pow(superScaled.sub(scaled)));
                cost = startCost.mul(new Decimal(2.5).pow(level.sub(superScaled)));
            }

            return cost;
        },

        effect: function (index) {
            let totalMult = new Decimal(1).add(game.pointUpgradeLevels[index]);
            totalMult = totalMult.mul(getEffects("upgrade-power", "multiplier", this));
            return totalMult;
        },
        effectDescription: function (index) {
            return "Currently: x" + formatNumber(this.effect(index)) + " to points";
        }
    },

    {
        name: "Compound",
        description: function () {
            let base = this.base.add(this.getBase())
            if (base.lt(1000)) {
                return "x" + base.toNumber().toFixed(2) + " points per level"
            } else {
                return "x" + formatNumber(base) + " points per level"
            }
        },
        baseCost: new Decimal(1000),
        costScaling: new Decimal(3),
        ScaledCostScaling: new Decimal(5),
        SuperScaledCostScaling: new Decimal(7.5),
        base: new Decimal(2),
        getBase() {
            let BaseAddition = getEffects("compound", "addition");
            return BaseAddition;
        },
        ScaledLevel: new Decimal(25),
        SuperScaledLevel: new Decimal(100),
        softcapStart: new Decimal(1e27),
        strength: new Decimal(0.5),
        type: "points",
        effectType: "multiplier",
        category: "compound",
        challengeCounted: true,
        getCost: function (index) {
            let level = game.pointUpgradeLevels[index];
            let scaled = this.ScaledLevel.add(getEffects("ScalingDelay", "addition"));
            let superScaled = this.SuperScaledLevel;
            let reduction = getEffects("point-upgrade", "reduction").mul(5);
            let scaling = [
                this.costScaling,
                this.ScaledCostScaling,
                this.SuperScaledCostScaling
            ].map(x => Decimal.max(1.01, x.sub(reduction)));
            let costScaling = scaling[0]
            let ScaledCostScaling = scaling[1]
            let SuperScaledCostScaling = scaling[2]
            let cost;
            if (level.gte(scaled)) {
                cost = this.baseCost.mul(costScaling.pow(scaled));
                level = level.sub(scaled);
            } else {
                return this.baseCost.mul(costScaling.pow(level));
            }
            if (level.gte(superScaled.sub(scaled))) {
                cost = cost.mul(ScaledCostScaling.pow(superScaled.sub(scaled)));
                level = level.sub(superScaled.sub(scaled));
            } else {
                return cost.mul(ScaledCostScaling.pow(level));
            }

            return cost.mul(SuperScaledCostScaling.pow(level));
        },

        effect: function (index) {
            let base;
            let weakenStrength = getEffects("weaker-softcap", "reduction")
            let strength = this.strength.add(weakenStrength);
            let softcapStart = this.softcapStart.mul(getEffects("SoftcapDelay", "multiplier"));
            base = this.base.add(this.getBase())
            let value = base.pow(game.pointUpgradeLevels[index]);
            let cap = softcapStart;
            if (value.gt(cap)) {
                value = value.div(cap).pow(strength).mul(cap);
            }
            return value;
        },
        effectDescription: function (index) {
            let base = this.base.add(this.getBase())
            let uncapped = base.pow(game.pointUpgradeLevels[index]);
            let softcapStart = this.softcapStart.mul(getEffects("SoftcapDelay", "multiplier"));
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
        description: function () {
            if (hasPrestigeUpgrade(5)) {
                return "1 autoclicker = 1 cps"
            } else if (hasPrestigeUpgrade(1)) {
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
        challengeCounted: false,
        getCost: function (index) {
            let level = game.pointUpgradeLevels[index];
            let scaled = this.ScaledLevel;
            let superScaled = this.SuperScaledLevel;
            let reduction = getEffects("point-upgrade", "reduction");
            let costScaling = this.costScaling.sub(reduction);
            costScaling = Decimal.max(1.01, costScaling);
            let cost;
            if (level.lt(scaled)) {
                cost = this.baseCost.mul(costScaling.pow(level));

            } else if (level.lt(superScaled)) {
                let startCost = this.baseCost.mul(costScaling.pow(scaled));
                cost = startCost.mul(new Decimal(5).pow(level.sub(scaled)));

            } else {
                let startCost = this.baseCost
                    .mul(costScaling.pow(scaled))
                    .mul(new Decimal(5).pow(superScaled.sub(scaled)));
                cost = startCost.mul(new Decimal(10).pow(level.sub(superScaled)));
            }

            return cost;
        },

        effect: function (index) {
            return new Decimal(0).add(game.pointUpgradeLevels[index]);
        },
        effectDescription: function (index) {
            return "Currently: " + formatNumber(this.effect(index)) + " autoclickers";
        }
    }
];

function getTotalPointUpgradeLevels() {
    let total = new Decimal(0);

    game.pointUpgradeLevels.forEach((level, index) => {
        if (PointUpgrades[index].challengeCounted === false) return;

        total = total.add(level);
    });

    return total;
}

function buyPointUpgrade(index) {
    let remaining = Infinity;
    
    if (inChallenge(1)) {
        remaining = 10 - getTotalPointUpgradeLevels().toNumber();

        if (remaining <= 0) return;
    }
    let upg = PointUpgrades[index];
    let cost = upg.getCost(index);
    if (game.points.gte(cost)) {
        game.points = game.points.sub(cost);
        game.pointUpgradeLevels[index] = game.pointUpgradeLevels[index].add(1);
    }
}

function buyPointUpgradeMax(index) {
    let upg = PointUpgrades[index];
    let points = game.points;

    while (true) {

        let remaining = Infinity;

        if (inChallenge(1)) {
            remaining = 10 - getTotalPointUpgradeLevels().toNumber();

            if (remaining <= 0) return;
        }

        let cost = upg.getCost(index);
        if (points.lt(cost)) break;

        let bulk = 1;

        let totalCost = new Decimal(0);

        for (let i = 0; i < bulk; i++) {
            if (inChallenge(1)) {
                remaining = 10 - getTotalPointUpgradeLevels().toNumber();

                if (remaining <= 0) break;
            }
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

        button.onclick = function () {
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
            maxButton.onclick = function () {
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

function Idle(diff) {
    if (game.points.gte(game.the_limit)) return;
    let pointsFromAutoclickers = PointUpgrades[3].effect(3)
        .mul(getTotalPointMultiplier())
        .mul((diff / 5) * (getEffects("autoclicker", "multiplier")));
    game.points = game.points.add(pointsFromAutoclickers);
}