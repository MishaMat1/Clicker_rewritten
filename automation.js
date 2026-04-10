const Automations = [
{
    id: "pointUpgrades",
    name: "Point Upgrades",
    data: () => game.pointAuto,
    currency: () => game.prestigePoints,
    currencyName: "PP",

    unlocked() {
        return true;
    },

    toggle() {
        this.data().enabled = !this.data().enabled;
    },

    isEnabled() {
        return this.data().enabled;
    },

    getCost() {
        let baseCost = new Decimal(1e5);
        return baseCost.mul(Decimal.pow(1.75, this.data().level));
    },

    getInterval() {
        return getPointAutoInterval();
    },

    upgrade() {
        let d = this.data();

        if (d.level >= d.maxLevel) return;

        let cost = this.getCost();

        if (game.prestigePoints.gte(cost)) {
            game.prestigePoints = game.prestigePoints.sub(cost);
            d.level++;
        }
    }
},
{
    id: "prestigeBuyables",
    name: "Prestige Buyables",
    data: () => game.prestigeAuto,
    currencyName: "AP",

    unlocked() {
        return hasAscensionMilestone(5);
    },

    toggle() {
        this.data().enabled = !this.data().enabled;
    },

    isEnabled() {
        return this.data().enabled;
    },

    getCost() {
        let baseCost = new Decimal(10);
        return baseCost.mul(Decimal.pow(1.75, this.data().level));
    },

    getInterval() {
        return getPrestigeAutoInterval();
    },

    upgrade() {

        let d = this.data();

        if (d.level >= d.maxLevel) return;

        let cost = this.getCost();

        if (game.ascensionPoints.gte(cost)) {
            game.ascensionPoints = game.ascensionPoints.sub(cost);
            d.level++;
        }
    }
}
];

function generateAutomationUI() {
    let container = document.getElementById("automationTab");
    container.innerHTML = "<h2>Automation</h2>";

    Automations.forEach(auto => {
        if (auto.unlocked && !auto.unlocked()) return;

        let data = auto.data();

        let box = document.createElement("div");

        let name = document.createElement("p");
        name.textContent = auto.name;

        let enabled = document.createElement("p");
        enabled.textContent = auto.isEnabled()
            ? "Status: on"
            : "Status: off";

        let button = document.createElement("button");
        button.textContent = auto.isEnabled()
            ? "Disable"
            : "Enable";

        let upgradeBtn = document.createElement("button");

        upgradeBtn.textContent =
            data.level >= data.maxLevel
            ? "MAXED"
            : "Decrease Interval: " +
              formatNumber(auto.getCost()) +
              " " + auto.currencyName;

        upgradeBtn.onclick = () => {
            auto.upgrade();
            generateAutomationUI();
            loadPrestigeUpgrades();
            loadAscensionUpgrades();
        };

        button.onclick = () => {
            auto.toggle();
            generateAutomationUI();
        };

        let speed = document.createElement("p");
        let interval = auto.getInterval() ?? 1;
        speed.textContent = "Speed: " + interval.toFixed(2) + "s";

        box.appendChild(name);
        box.appendChild(enabled);
        box.appendChild(button);
        box.appendChild(speed);
        box.appendChild(upgradeBtn);

        container.appendChild(box);
    });
}

function getPointAutoInterval() {
    let base = 1
    let reduction = 0.05
    let interval = base - game.pointAuto.level * reduction;
    return Math.max(0.05, interval);
}
function getPrestigeAutoInterval() {
    if (hasAscensionMilestone(5)) {
    let base = 1
    let reduction = 0.05
    let interval = base - game.prestigeAuto.level * reduction;
    return Math.max(0.05, interval);
    }
}
generateAutomationUI();