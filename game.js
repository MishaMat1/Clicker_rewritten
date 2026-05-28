const CURRENT_VERSION = "1.4.1";

const game = {
    version: CURRENT_VERSION,
    points: new Decimal(0),
    prestigePoints: new Decimal(0),
    prestigeRequirement: new Decimal(1e6),
    prestigeResetAmount: new Decimal(0),
    charge: new Decimal(0),
    supercharge: new Decimal(0),
    totalSupercharge: new Decimal(0),
    superchargeRequirement: new Decimal(1e6),
    darkCharge: new Decimal(0),
    ascensionPoints: new Decimal(0),
    TotalAscensionPoints: new Decimal(0),
    ascensionResetAmount: new Decimal(0),
    ascendRequirement: new Decimal(1e9),
    the_limit: new Decimal("1.8e308"),
    pointAuto: {
        enabled: false,
        timer: 0,
        level: 0,
        maxLevel: 19,
    },
    prestigeAuto: {
        enabled: false,
        timer: 0,
        level: 0,
        maxLevel: 19,
    },
    pointUpgradeLevels: [],

    prestigeUpgradesBought: [],
    prestigeBuyableLevels: [],
    chargeMilestones: [],
    darkChargeNerfs: [],
    superchargeUpgradeLevels: [],

    ascensionUpgradesBought: [],
    ascensionMilestones: [],

    activeChallenge: null,
    challengeCompletions: {
        0: 0,
        1: 0,
        2: 0,
        3: 0
    }
}

const EffectSources = {
    sources: [
        {
            source: () => PointUpgrades,
            active: (item, id) =>
                game.pointUpgradeLevels[id] && game.pointUpgradeLevels[id].gt(0)
        },
        {
            source: () => PrestigeUpgrades,
            active: (item, id) =>
                game.prestigeUpgradesBought[id] === true
        },

        {

            source: () => PrestigeBuyables,
            active: (item) =>
                item.unlocked() && game.prestigeBuyableLevels[item.id].gt(0)
        },

        {
            source: () => ChargeMilestones,
            active: (item) =>
                game.chargeMilestones[item.id]
        },

        {
            source: () => DarkChargeNerfs,
            active: (item) =>
                game.darkChargeNerfs[item.id]
        },

        {
            source: () => SuperchargeUpgrades,
            active: (item, id) =>
                game.superchargeUpgradeLevels[id] && game.superchargeUpgradeLevels[id] > 0
        },
        
        {
            source: () => AscensionMilestones,
            active: (item) =>
                item.obtained
        },

        {
            source: () => AscensionUpgrades,
            active: (item, id) =>
                game.ascensionUpgradesBought[id] === true
        },

        {
            source: () => Challenges,
            active: (item, id) =>
                getChallengeCompletions(id) > 0
        }

    ],
};

function getEffects(type, effectType, ignoredItem = null) {
    let value;

    switch (effectType) {
        case "multiplier":
        case "exponent":
        case "division":
            value = new Decimal(1);
            break;

        case "addition":
        case "reduction":
            value = new Decimal(0);
            break;

        default:
            value = new Decimal(1);
    }

    EffectSources.sources.forEach(group => {
        group.source().forEach((item, id) => {

            if(item == ignoredItem) return;

            if (
                group.active(item, id) &&
                item.type === type &&
                item.effectType === effectType &&
                item.effect && 
                (item.unlockLevel === undefined || (game.superchargeUpgradeLevels[2] || 0) >= item.unlockLevel)
            ) {

                switch (effectType) {

                    case "multiplier":
                    case "exponent":
                    case "division":
                        value = value.mul(item.effect(id));
                        break;

                    case "addition":
                    case "reduction":
                        value = value.add(item.effect(id));
                        break;
                }
            }
        });
    });

    return value;
}