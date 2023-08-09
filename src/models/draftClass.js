module.exports = class Draft {
  status;
  leader;
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
