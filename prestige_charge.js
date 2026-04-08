let ChargeMilestones = [
    {
        id: 0,
        name: "Charged points",
        requirement: new Decimal(1),
        type: "points",
        effect: function(){
            return Decimal.max(1, Decimal.log(game.charge, 2))
        },
        effectDescription: function() {
            return "Currently: x" + formatEffect(this.effect());
        }
    },
    {
        id: 1,
        name: "Charged prestige",
        requirement: new Decimal(100),
        type: "prestige",
        effect: function() {
            return Decimal.max(1, Decimal.log(game.charge, 3))
        },
        effectDescription: function() {
            return "Currently: x" + formatEffect(this.effect());
        }
    },
    // POSSIBLY FUTURE MILESTONE (its too op for now so ill add it later)
    // { 
    //     id: 2,
    //     name: "Charged compound",
    //     requirement: new Decimal(1000),
    //     type: "compound",
    //     effect: function(){
    //         return new Decimal(game.charge.div(1e5))
    //     },
    //     effectDescription: function() {
    //         return "Currently + " + formatEffect(this.effect())
    //     }
    // }
]

function formatEffect(eff) {
    return eff.gte(1000)
        ? formatNumber(eff)
        : eff.toNumber().toFixed(2);
}

function getChargeMultiplier() {
    const chargeMultipliers = [PrestigeUpgBuyMultiplier("charge"), AscensionUpgMultiplier("charge")]
    let TotalChargeMulti = new Decimal(1)
    return chargeMultipliers.reduce((total, multi) => total.mul(multi), TotalChargeMulti)
}

function chargeGen(diff) {
    let chargeMulti = new Decimal(1).mul(diff).mul(getChargeMultiplier())
    game.charge = game.charge.add(chargeMulti)
}

function loadPrestigeCharge() {
    const featureContainer = document.getElementById("featureContainer");
    featureContainer.replaceChildren(); // clear old buttons

    ChargeMilestones.forEach(milestone => {
        let button = document.createElement("button");
        button.id = `charge-button-${milestone.id}`; // unique ID for updates
        updateMilestoneButton(button, milestone);      // set initial content
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

// --- Check milestones for completion ---
function updateChargeMilestones() {
    let updated = false;

    ChargeMilestones.forEach((milestone, i) => {

        if (!game.chargeMilestones[i] &&
            game.charge.gte(milestone.requirement)) {

            game.chargeMilestones[i] = true;
            updated = true;
        }
    });

    if (updated) loadPrestigeCharge();
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

function ChargeMulti(type) {
    let mult = new Decimal(1); 
    ChargeMilestones.forEach(milestone => {
        if (game.chargeMilestones[milestone.id] && milestone.effect && milestone.type === type) {
            mult = mult.mul(milestone.effect());
        }
    })
    return mult
}

function ChargeAdd(type){
    let add = new Decimal(0); 
    ChargeMilestones.forEach(milestone => {
        if (game.chargeMilestones[milestone.id] && milestone.effect && milestone.type === type) {
            add = add.add(milestone.effect());
        }
    })
    return add
}