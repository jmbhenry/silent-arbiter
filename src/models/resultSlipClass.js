module.exports = class resultSlip {
  redPlayer;
  bluePlayer;
  result;

  constructor(redPlayer, bluePlayer) {
    this.redPlayer = redPlayer;
    this.bluePlayer = bluePlayer;
    this.result = null;
  }

  getWinner() {
    if(this.result == "red")
      return this.redPlayer.id;
    else if(this.result == "blue")
      return this.bluePlayer.id;
    else if(this.result == "unplayed")
      return "unplayed";
    else return null;
  }
};
  