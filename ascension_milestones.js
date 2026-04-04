let AscensionMilestones = [
    {
        id: 0,
        name: "1 total ascension",
        description: "Welcome to ascension! Lets start with x2 PP",
        requirement: new Decimal(1),
        obtained: false,
        type: "prestige",
        effect() {
            return new Decimal(2)
        }
    },
    {
        id: 1,
        name: "5 total ascension",
        description: "Keep 1 autoclicker at prestige",
        requirement: new Decimal(5),
        obtained: false
    },
    {
        id: 2,
        name: "10 total ascension",
        description: "Boost points based on ascension resets amount",
        requirement: new Decimal(10),
        formula: new Decimal(0.6),
        obtained: false,
        type: "points",
        effect() {
            return game.ascensionResetAmount.pow(this.formula)
        },
        effectDescription() {
            return "Currently: x" + formatEffect(this.effect());
        }
    },
    {
        id: 3,
        name: "20 total ascension",
        description: "Keep automation at 0.5s on ascension reset",
        requirement: new Decimal(20),
        obtained: false
    },
    {
        id: 4,
        name: "50 total ascension",
        description: "Boost prestige points based on ascension resets amount",
        requirement: new Decimal(50),
        obtained: false,
        type: "prestige",
        formula: new Decimal(0.5),
        effect() {
            return game.ascensionResetAmount.pow(this.formula)
        },
        effectDescription() {
            return "Currently: x" + formatEffect(this.effect());
        }
    }
]

function loadAscensionMilestones() {
    const milestones = document.getElementById("ascMilestones")
    milestones.replaceChildren()
    AscensionMilestones.forEach(milestone => {
        let button = document.createElement("button");
        button.id = `ascension-button-${milestone.id}`;
        updateAscMilestoneDesc(button, milestone)
        milestones.appendChild(button)
        milestones.appendChild(document.createElement("br"))
    });
}

function updateAscMilestoneDesc(button, milestone) {
    let text = milestone.name + "<br>" +
               milestone.description + (milestone.obtained ? " (Obtained)" : "")
    button.innerHTML = text;
    if(milestone.effectDescription) {
            button.innerHTML += "<br>" + milestone.effectDescription();
        }
}

function updateAscensionMilestones() {
    let updated = false;
    AscensionMilestones.forEach(milestone => {
        if (!milestone.obtained && game.TotalAscensionPoints.gte(milestone.requirement)) {
            milestone.obtained = true;
            updated = true;
        }
    })
    if (updated) {
        loadAscensionMilestones();
    }
}

function AscensionMulti(type) {
    let mult = new Decimal(1); 
    AscensionMilestones.forEach(milestone => {
        if (milestone.obtained && milestone.effect && milestone.type === type) {
            mult = mult.mul(milestone.effect());
        }
    })
    return mult
}


function hasAscensionMilestone(id) {
    return !!AscensionMilestones.find(u => u.id === id)?.obtained
}
