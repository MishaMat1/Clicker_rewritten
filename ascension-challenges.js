let Challenges = [
    {
        id: 0,
        name: "Points reduction",
        type: "points",
        effectType: "exponent",
        description: "Points are square rooted (^0.5)",
        completionLimit: 1,
        goal: new Decimal(1e40),
        goalDescription: "1e40 points",
        reward: "Reward: Points are raised ^1.05",
        effect() {
            return new Decimal(1.05)
        },
    },
    {
        id: 1,
        name: "Limited upgrades",
        type: "weaker-softcap",
        effectType: "reduction",
        description: "You have only 10 purchases of point upgrades",
        completionLimit: 1,
        goal: new Decimal(1e50),
        goalDescription: "1e50 points",
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
        completionLimit: 1,
        goal: new Decimal(1e100),
        goalDescription: "1e100 points",
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
        completionLimit: 1,
        goal: new Decimal(1e115),
        goalDescription: "1e115 points",
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
        let completed = getChallengeCompletions(ch.id) > 0;
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
    game.prestigeUpgradesBought[13] = true;
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

function completeChallenge(ch) {
    let current = getChallengeCompletions(ch.id);
    let limit = ch.completionLimit ?? Infinity;

    if (current < limit) {
        game.challengeCompletions[ch.id] = current + 1;
    }
}

function updateChallenges() {
    if (game.activeChallenge === null) return;

    let ch = Challenges[game.activeChallenge];

    if (game.points.gte(ch.goal)) {
        completeChallenge(ch);
        game.activeChallenge = null;
        ascendReset();
        loadSuperchargeUpgrades();
        loadAscensionChallenges();
    }
    if (getChallengeCompletions(3) > 0) {
        document.getElementById("superchargeContainer").style.display = "inline-block";
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

function getChallengeCompletions(id) {
    return game.challengeCompletions[id] || 0;
}

function getCompletedChallengesCount() {
    return Object.values(game.challengeCompletions).reduce((a, b) => a + b, 0);
}

function getChallengeAscensionMultiplier() {
    let count = getCompletedChallengesCount();
    return new Decimal(2).pow(count);
}