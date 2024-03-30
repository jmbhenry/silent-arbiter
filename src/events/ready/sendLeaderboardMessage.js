const updateLeaderboard = require("../../handlers/leaderboardHandlers/updateLeaderboard.js");

module.exports = async (client) => {
    try {
        client.guilds.cache.forEach(async (guild) => {
          updateLeaderboard(client, guild);
        });
      } catch (error) {
        log("sendLeaderboardMessage.js", `${error}`);
      }
};