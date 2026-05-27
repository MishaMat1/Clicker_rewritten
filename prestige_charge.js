let ChargeMilestones = [
    {
        id: 0,
        unlockLevel: 0,
        name: "Charged points",
        requirement: new Decimal(1),
        type: "points",
        effectType: "multiplier",
        effect: function () {
            return Decimal.max(1, Decimal.log(game.charge, 2)).pow(getEffects("charge-milestone", "exponent"))
        },
        effectDescription: function () {
            return "Currently: x" + formatEffect(this.effect());
        }
    },
    {
        id: 1,
        unlockLevel: 0,
        name: "Charged prestige",
        requirement: new Decimal(100),
        type: "prestige",
        effectType: "multiplier",
        effect: function () {
            return Decimal.max(1, Decimal.log(game.charge, 3)).pow(getEffects("charge-milestone", "exponent"))
        },
        effectDescription: function () {
            return "Currently: x" + formatEffect(this.effect());
        }
    },
    { 
        id: 2,
        unlockLevel: 1,
        name: "Charged compound softcap delay",
        requirement: new Decimal(1e9),
        type: "SoftcapDelay",
        effectType: "multiplier",
        effect: function(){
            return new Decimal(game.charge).pow(2)
        },
        effectDescription: function() {
            return "Currently x" + formatEffect(this.effect()) + " later";
        }
    },
    {
        id: 3,
        unlockLevel: 2,
        name: "Charged ascension",
        requirement: new Decimal(1e10),
        type: "ascension",
        effectType: "multiplier",
        effect: function(){
            return Decimal.max(1, Decimal.log(game.charge, 10)).pow(2)
        },
        effectDescription: function() {
            return "Currently x" + formatEffect(this.effect())
        }
    }
]

let DarkChargeNerfs = [
    {
        id: 0,
        name: "Dark points",
        requirement: new Decimal(1),
        type: "points",
        effectType: "division",
        effect: function () {
            return Decimal.max(1, game.darkCharge.pow(0.9))
        },
        effectDescription: function () {
            return "Currently: /" + formatEffect(this.effect());
        }
    },
    {
        id: 1,
        name: "Dark prestige",
        requirement: new Decimal(1),
        type: "prestige",
        effectType: "division",
        effect: function () {
            return Decimal.max(1, game.darkCharge.pow(0.8))
        },
        effectDescription: function () {
            return "Currently: /" + formatEffect(this.effect());
        }
    }
]

function formatEffect(eff) {
    return eff.gte(1000)
        ? formatNumber(eff)
        : eff.toNumber().toFixed(2);
}

function getChargeMultiplier() {
    let ChargeMulti = getEffects("charge", "multiplier");
    return ChargeMulti;
}

function chargeGen(diff) {
    let chargeMulti = new Decimal(1).mul(diff).mul(getChargeMultiplier())
    if (inChallenge(3)) {
        game.darkCharge = game.darkCharge.add(new Decimal(1).mul(diff))
    } else {
        game.charge = game.charge.add(chargeMulti);
    }
}

function loadPrestigeCharge() {
    if (inChallenge(3)) return loadDarkCharge();
    document.getElementById("chargeName").innerText = "Charge:";
    document.getElementById("chargeMilestones").innerText = "Charge milestones:";
    const featureContainer = document.getElementById("featureContainer");
    featureContainer.replaceChildren(); // clear old buttons

    ChargeMilestones.forEach(milestone => {
        if (!isChargeMilestoneUnlocked(milestone)) return; // skip locked milestones
        let button = document.createElement("button");
        button.id = `charge-button-${milestone.id}`; // unique ID for updates
        updateMilestoneButton(button, milestone);      // set initial content
        featureContainer.appendChild(button);
        featureContainer.appendChild(document.createElement("br"));
    });
}

function loadDarkCharge() {
    document.getElementById("chargeName").innerText = "Dark Charge:";
    document.getElementById("chargeMilestones").innerText = "Dark charge nerfs:";
    const featureContainer = document.getElementById("featureContainer");
    featureContainer.replaceChildren(); // clear old buttons
    DarkChargeNerfs.forEach(nerf => {
        let button = document.createElement("button");
        button.id = `dark-charge-button-${nerf.id}`;
        updateNerfButton(button, nerf);
        featureContainer.appendChild(button);
        featureContainer.appendChild(document.createElement("br"));
    });
}

// --- Update individual button ---
function updateMilestoneButton(button, milestone) {
    let text = milestone.name + "<br>" +
        "Requirement: " + formatNumber(milestone.requirement) + " charge" +
        (game.chargeMilestones[milestone.id] ? " (Obtained)" : "") +
        "<br>" + milestone.effectDescription();
    button.innerHTML = text;
    button.classList.remove("obtained", "unobtained");
    button.classList.add(game.chargeMilestones[milestone.id] ? "obtained" : "unobtained");
}

function updateNerfButton(button, nerf) {
    let text = nerf.name + "<br>" +
        "Requirement: " + formatNumber(nerf.requirement) + " dark charge" +
        (game.darkChargeNerfs[nerf.id] ? " (Active)" : "") +
        "<br>" + nerf.effectDescription();
    button.innerHTML = text;
    button.classList.remove("obtained", "unobtained");
    button.classList.add(game.darkChargeNerfs[nerf.id] ? "obtained" : "unobtained");
}

// --- Check milestones for completion ---
function updateChargeMilestones() {
    let updated = false;
    if (inChallenge(3)) {
        DarkChargeNerfs.forEach((nerf, i) => {

            if (!game.darkChargeNerfs[i] &&
                game.darkCharge.gte(nerf.requirement)) {

                game.darkChargeNerfs[i] = true;
                updated = true;
            }
        })
    } else {

        ChargeMilestones.forEach((milestone, i) => {
            if (!isChargeMilestoneUnlocked(milestone)) return; // skip locked milestones

            if (!game.chargeMilestones[i] &&
                game.charge.gte(milestone.requirement)) {

                game.chargeMilestones[i] = true;
                updated = true;
            }
        });
    }

    if (updated) {
        if (inChallenge(3)) {
            loadDarkCharge();
        } else {
            loadPrestigeCharge();
        }
    }
}
// Reload UI if any milestone changed 

// --- Update effect descriptions in UI ---
function updateEffectDescription() {
    ChargeMilestones.forEach(milestone => {
        const button = document.getElementById(`charge-button-${milestone.id}`);
        if (button) {
            updateMilestoneButton(button, milestone);
        }
    });
}

function updateNerfDescription() {
    DarkChargeNerfs.forEach(nerf => {
        const button = document.getElementById(`dark-charge-button-${nerf.id}`);
        if (button) {
            updateNerfButton(button, nerf);
        }
    });
}

function DarkChargeNerf(type) {
    let TotalNerf = new Decimal(1);
    DarkChargeNerfs.forEach(nerf => {
        if (game.darkChargeNerfs[nerf.id] && nerf.effect && nerf.type === type) {
            TotalNerf = TotalNerf.mul(nerf.effect());
        }
    })
    return TotalNerf
}

function getSuperchargeGain() {
    return Decimal.floor(game.charge.div(game.superchargeRequirement))
}

function supercharge() {
    if (game.charge.gte(game.superchargeRequirement)) {
        const gain = getSuperchargeGain();
        game.supercharge = game.supercharge.add(gain);
        game.totalSupercharge = game.totalSupercharge.add(gain);
        game.charge = new Decimal(0);
        loadSuperchargeUpgrades();
    }
}

function isChargeMilestoneUnlocked(milestone) {
    let level = game.superchargeUpgradeLevels[2] || 0;
    return level >= milestone.unlockLevel;
}

let SuperchargeUpgrades = [
    {
        id: 0,
        name: "More charge",
        description: "x2 charge gain per level",
        type: "charge",
        effectType: "multiplier",
        maxLevel: 10,
        effect(){
            let level = game.superchargeUpgradeLevels[this.id] || 0;
            return new Decimal(2).pow(level);
        },
        cost(level) {
            return new Decimal(5).pow(level)   
        }
    },
    {
        id: 1,
        name: "Stronger milestones",
        description: "Square 1st and 2nd charge milestone effects",
        type: "charge-milestone",
        effectType: "exponent",
        maxLevel: 1,
        effect(){
            return new Decimal(2)
        },
        cost() {
            return new Decimal(100)
        }
    },
    {
        id: 2,
        name: "New charge milestones",
        description: "Unlock a new charge milestone",
        type: "unlock",
        maxLevel: 2,
        effectType: "none",
        cost(level) {
            return new Decimal(1000).mul(new Decimal(10).pow(level));
        }
    }
];

function loadSuperchargeUpgrades() {
    if(!game.completedChallenges[3]) return;
    const container = document.getElementById("superchargeUpgrades");
    container.replaceChildren(); 
    SuperchargeUpgrades.forEach(upgrade => {
        let level = game.superchargeUpgradeLevels[upgrade.id] || 0;
        let button = document.createElement("button");
        button.id = `supercharge-upgrade-${upgrade.id}`;
        button.innerHTML = upgrade.name + "<br>" + upgrade.description + "<br>" +
        "Level: " + level + "/" + upgrade.maxLevel +
        "<br>Cost: " + formatNumber(upgrade.cost(level)) + " supercharge";
        container.appendChild(button);
        button.addEventListener("click", () => buySuperchargeUpgrade(upgrade.id));
    });
}

function buySuperchargeUpgrade(id) {
    let upg = SuperchargeUpgrades[id];

    let level = game.superchargeUpgradeLevels[id] || 0;
    if (level >= upg.maxLevel) return;
    let cost = upg.cost(level);
    if (game.supercharge.gte(cost)) {
        game.supercharge = game.supercharge.sub(cost);
        game.superchargeUpgradeLevels[id]++;
    }
    loadSuperchargeUpgrades();
    loadPrestigeCharge(); // in case new milestones are unlocked  
}