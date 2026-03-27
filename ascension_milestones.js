let AscensionMilestones = [
    {
        id: 1,
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
        id: 2,
        name: "5 total ascension",
        description: "Keep 1 autoclicker at prestige",
        requirement: new Decimal(5),
        obtained: false
    }
]

function loadAscensionMilestones() {
    const milestones = document.getElementById("ascMilestones")
    milestones.replaceChildren()
    AscensionMilestones.forEach((milestone) => {
        let button = document.createElement("button")
        let text = milestone.name + "<br>" + milestone.description +
               (milestone.obtained ? " (Obtained)" : "") 
    button.innerHTML = text;
    milestones.appendChild(button)
    milestones.appendChild(document.createElement("br"))
    })
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
