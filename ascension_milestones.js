let AscensionMilestones = [
    {
        id: 0,
        name: "1 total ascension points",
        description: "Welcome to ascension! Lets start with x2 PP",
        requirement: new Decimal(1),
        type: "prestige",
        effectType: "multiplier",
        effect() {
            return new Decimal(2)
        }
    },
    {
        id: 1,
        name: "5 total ascension points",
        description: "Keep 1 autoclicker at prestige",
        requirement: new Decimal(5)
    },
    
    {
        id: 2,
        name: "20 total ascension points",
        description: "Keep automation at 0.5s on ascension reset",
        requirement: new Decimal(20)
    },
    {
        id: 3,
        name: "50 total ascension points",
        description: "Keep charge unlock upgrade",
        requirement: new Decimal(50),
    },
    {
        id: 4,
        name: "100 total ascension points",
        description: "Point upgrades auto is no longer reset on ascension",
        requirement: new Decimal(100)
    },
    {
        id: 5,
        name: "200 total ascension points",
        description: "Unlock prestige buyables autobuyer",
        requirement: new Decimal(200)
    },
    {
        id: 6,
        name: "500 total ascension points",
        description: "Keep prestige upgrades on ascension",
        requirement: new Decimal(500)
    },
    {
        id: 7,
        name: "1K total ascension points",
        description: "Keep 10 autoclickers on ascension (useless i know)",
        requirement: new Decimal(1000)
    },
    {
        id: 8,
        name: "100K total ascension points",
        description: "Generate prestige points at a rate of 1% per second",
        requirement: new Decimal(100000)
    },
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
               milestone.description + (game.ascensionMilestones[milestone.id] ? " (Obtained)" : "")
    button.innerHTML = text;
    button.classList.remove("obtained", "unobtained");
    button.classList.add(game.ascensionMilestones[milestone.id] ? "obtained" : "unobtained");
    if(milestone.effectDescription) {
            button.innerHTML += "<br>" + milestone.effectDescription();
        }
}

function updateAscensionMilestones() {
    let updated = false;
    AscensionMilestones.forEach(milestone => {
        if (!game.ascensionMilestones[milestone.id] && game.TotalAscensionPoints.gte(milestone.requirement)) {
            game.ascensionMilestones[milestone.id] = true;
            updated = true;
        }
    })


    if (updated) {
        loadAscensionMilestones();
        generateAutomationUI();
    }
}

function hasAscensionMilestone(id) {
    return !!game.ascensionMilestones[id]
}
