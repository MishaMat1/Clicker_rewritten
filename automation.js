const Automations = [
{
    id: "pointUpgrades",
    name: "Point Upgrades",
    toggle: function() {
        game.pointAuto.enabled = !game.pointAuto.enabled;
    },
    isEnabled: function() {
        return game.pointAuto.enabled;
    },
    getCost: function() {
        let baseCost = new Decimal(1e5);
        return baseCost.mul(Decimal.pow(1.75, game.pointAuto.level));
    },
    upgrade() {
    if(game.pointAuto.level >= (game.pointAuto.maxLevel)) return
    let cost = this.getCost();
         if (game.prestigePoints.gte(cost)) {
            game.prestigePoints = game.prestigePoints.sub(cost);
            game.pointAuto.level++;
        }
    }
}
];

function generateAutomationUI() {
    let container = document.getElementById("automationTab");
    container.innerHTML = "<h2>Automation</h2>";
    Automations.forEach(auto => {
        let box = document.createElement("div");
        let name = document.createElement("p");
        name.textContent = auto.name;
        let enabled = document.createElement("p")
        enabled.textContent = auto.isEnabled() ? "Status: on" : "Status: off";
        let button = document.createElement("button");
        button.textContent = auto.isEnabled() ? "Disable" : "Enable";
        let upgradeBtn = document.createElement("button");
        upgradeBtn.textContent = game.pointAuto.level >= game.pointAuto.maxLevel ?
        "MAXED" : "Decrease Interval: " + formatNumber(auto.getCost()) + " PP";

        upgradeBtn.onclick = () => {
            auto.upgrade();
            generateAutomationUI();
            loadPrestigeUpgrades();
        };

        button.onclick = () => {
            auto.toggle();
            generateAutomationUI();
        };

        let speed = document.createElement("p");
        let interval = getPointAutoInterval() ?? 1;
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
    if (hasPrestigeUpgrade(9)) {
    document.getElementById("automationButton").style.display = "inline-block";
    let base = 1
    let reduction = 0.05
    let interval = base - game.pointAuto.level * reduction;
    return Math.max(0.05, interval);
}
}
generateAutomationUI();

