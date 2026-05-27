let Challenges = [
    {
        id: 0,
        name: "Points reduction",
        type: "points",
        effectType: "exponent",
        description: "Points are square rooted (^0.5)",
        goal: new Decimal(1e36),
        goalDescription: "1e36 points",
        reward: "Reward: Points are raised ^1.05",
        effect() {
            return new Decimal(1.05)
        },
    },
    {
        id: 1,
        name: "No upgrades",
        type: "weaker-softcap",
        effectType: "reduction",
        description: "You cannot buy any point upgrades",
        goal: new Decimal(1e29),
        goalDescription: "1e29 points",
        reward: "Reward: Weaken compound softcap exponent by 0.1",
        effect() {
            return new Decimal(0.1)
        },
    },
    {
        id: 2,
        name: "No prestige",
        type: "prestige",
        effectType: "exponent",
        description: "You cannot gain prestige points",
        goal: new Decimal(1e24),
        goalDescription: "1e24 points",
        reward: "Reward: Prestige points are raised ^1.05",
        effect() {
            return new Decimal(1.05)
        }
    },
    {
        id: 3,
        name: "Dark charge...?",
        type: "unlock",
        description: "Charge is replaced with dark charge which nerfs you instead",
        goal: new Decimal(1e100),
        goalDescription: "1e100 points",
        reward: "Reward: Expand charge feature",
        effect() {
            return null;
        }
    }
]



function loadAscensionChallenges() {
    let challengesContainer = document.getElementById("ascChallenges");
    challengesContainer.replaceChildren()
        Challenges.forEach(ch => {
        let button = document.createElement("button");
        let completed = game.completedChallenges.includes(ch.id);
        let active = game.activeChallenge === ch.id;

        let statusText = "";
        if (completed) statusText = "Completed";
        else if (active) statusText = "In Challenge";
        else statusText = "Not completed";

        button.innerHTML =
            ch.name + "<br>" +
            ch.description + "<br>" +
            "Goal: " + ch.goalDescription + "<br>" +
            ch.reward + "<br>" + statusText;

        if (completed) button.style.borderColor = "green";
        else if (active) button.style.borderColor = "orange";
        else button.style.borderColor = "black";

        button.onclick = () => startChallenge(ch.id);

        challengesContainer.appendChild(button);
    });
}

function startChallenge(id) {
    let ch = Challenges[id];
    game.activeChallenge = id;
    ascendReset();
    game.prestigeUpgradesBought = game.prestigeUpgradesBought.map((bought, i) => {
    return PrestigeUpgrades[i] && PrestigeUpgrades[i].permanent ? bought : false;
    });
    loadPrestigeUpgrades();
    loadAscensionChallenges();
    loadPrestigeCharge();
    if (ch.id === 3) {
        game.darkCharge = new Decimal(0);
        loadDarkCharge();
    }
}

function exitChallenge() {
    if (game.activeChallenge === null) return;

    game.activeChallenge = null;
    loadAscensionChallenges();
    loadPrestigeCharge();
}

function inChallenge(id) {
    return game.activeChallenge === id;
}

function updateChallenges() {
    if (game.activeChallenge === null) return;

    let ch = Challenges[game.activeChallenge];

    if (game.points.gte(ch.goal)) {
        if (!game.completedChallenges.includes(ch.id)) {
            game.completedChallenges.push(ch.id);
        }

        game.activeChallenge = null;
        ascendReset();
        loadSuperchargeUpgrades();
    }
}

function updateChallengeUI() {
    let display = document.getElementById("activeChallengeDisplay");
    let leaveBtn = document.getElementById("leaveChallengeBtn");

    if (game.activeChallenge === null) {
        display.innerText = "Not in a challenge";
        leaveBtn.style.display = "none";
    } else {
        let ch = Challenges[game.activeChallenge];
        display.innerText = "In Challenge: " + ch.name;
        leaveBtn.style.display = "inline-block";
    }
}

function getCompletedChallengesCount() {
    return game.completedChallenges.length;
}

function getChallengeAscensionMultiplier() {
    let count = getCompletedChallengesCount();
    return new Decimal(2).pow(count);
}