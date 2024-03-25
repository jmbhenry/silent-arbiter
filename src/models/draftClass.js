module.exports = class Draft {
  status;
  teamFormation;
  leader;
  players;
  redCaptain;
  redTeam;
  blueCaptain;
  blueTeam;
  result;
  link;

  constructor() {
    this.status = "queue";
    this.teamFormation = "random";
    this.players = [];
    this.redTeam = [];
    this.blueTeam = [];
  }
};
