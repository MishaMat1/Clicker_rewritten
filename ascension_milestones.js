let AscensionMilestones = [
    {
        id: 0,
        name: "1 total ascension points",
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
        name: "5 total ascension points",
        description: "Keep 1 autoclicker at prestige",
        requirement: new Decimal(5),
        obtained: false
    },
    
    {
        id: 2,
        name: "20 total ascension points",
        description: "Keep automation at 0.5s on ascension reset",
        requirement: new Decimal(20),
        obtained: false
    },
    {
        id: 3,
        name: "50 total ascension points",
        description: "Keep charge unlock upgrade",
        requirement: new Decimal(50),
        obtained: false,
    },
    {
        id: 4,
        name: "100 total ascension points",
        description: "Point upgrades auto is no longer reset on ascension",
        requirement: new Decimal(100),
        obtained: false
    },
    {
        id: 5,
        name: "200 total ascension points",
        description: "Unlock prestige buyables autobuyer",
        requirement: new Decimal(200),
        obtained: false
    },
    {
        id: 6,
        name: "500 total ascension points",
        description: "Keep prestige upgrades on ascension",
        requirement: new Decimal(500),
        obtained: false
    },
    {
        id: 7,
        name: "1K total ascension points",
        description: "Idk yet",
        requirement: new Decimal(1000),
        obtained: false
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
    button.classList.remove("obtained", "unobtained");
    button.classList.add(milestone.obtained ? "obtained" : "unobtained");
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
        generateAutomationUI();
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
