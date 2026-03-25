const game = {
    points: new Decimal(0),
    prestigePoints: new Decimal(0),
    prestigeRequirement: new Decimal(1e6),
    charge: new Decimal(0),
    ascensionPoints: new Decimal(0),
    TotalAscensionPoints: new Decimal(0),
    ascendRequirement: new Decimal(1e9),
    pointAuto: {
        enabled: false,
        timer: 0,
        level: 0,
        maxLevel: 19,
    }
}