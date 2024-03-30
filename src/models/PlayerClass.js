module.exports = class Player {
    id;
    wins;
    losses;

    constructor(id) {
        this.id = id;
        this.wins=0;
        this.losses=0;
    }

    winrate() {
        return 100*this.wins/(this.wins+this.losses)
    }
}