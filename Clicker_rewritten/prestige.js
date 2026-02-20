function prestigeReset() {
    game.points = new Decimal(0);
    game.clickPower = new Decimal(0);
    game.clickPowerEffect = new Decimal(1);
    game.clickPowerCost = new Decimal(10);
    game.multiplier = new Decimal(0);
    game.multiplierEffect = new Decimal(1);
    game.multiplierCost = new Decimal(50);
    game.compound = new Decimal(0);
    game.compoundCost = new Decimal(1000);
    game.compoundEffect = new Decimal(1);
    game.autoclickers = new Decimal(0);
    game.autoclickerCost = new Decimal(100);
}

function prestigeGain(){
    if(game.points.gte(game.prestigeRequirement)){
        let PrestigeGain = Decimal.log(Decimal.floor(game.points.div(game.prestigeRequirement.div(10))), 10);
        game.prestigePoints = game.prestigePoints.add(PrestigeGain);
        prestigeReset();
    }
}