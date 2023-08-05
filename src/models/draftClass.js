module.exports = class Draft {
  status;
  players;
  redCaptain;
  redTeam;
  blueCaptain;
  blueTeam;

  constructor() {
    this.status = "queue";
    this.players = [];
    this.redTeam = [];
    this.blueTeam = [];
  }
};
