const CURRENT_VERSION = "1.2.1";

const game = {
    version: CURRENT_VERSION,
    points: new Decimal(0),
    prestigePoints: new Decimal(0),
    prestigeRequirement: new Decimal(1e6),
    prestigeResetAmount: new Decimal(0),
    charge: new Decimal(0),
    ascensionPoints: new Decimal(0),
    TotalAscensionPoints: new Decimal(0),
    ascensionResetAmount: new Decimal(0),
    ascendRequirement: new Decimal(1e9),
    pointAuto: {
        enabled: false,
        timer: 0,
        level: 0,
        maxLevel: 19,
    },
    pointUpgradeLevels: [],

    prestigeUpgradesBought: [],
    prestigeBuyableLevels: [],
    chargeMilestones: [],

    ascensionUpgradesBought: [],
    ascensionMilestones: [],

}