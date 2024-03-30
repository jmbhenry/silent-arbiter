const guildEnv = require("../../guildEnv.js");
const log = require("../../utils/log.js");
const { EmbedBuilder } = require("@discordjs/builders");
const alltimeWinrate = require("../../handlers/leaderboardHandlers/alltimeWinrate.js");
const matchesPlayed = require("../../handlers/leaderboardHandlers/matchesPlayed.js");
const topLebaneseMentalHealthCounselor = require("../../handlers/leaderboardHandlers/topLebaneseMentalHealthCounselor.js");


module.exports = async(client, guild) => {
    const ge = guildEnv(guild.id);
    const channel = await client.channels.cache.get(ge.LEADERBOARD_CHANNEL);
    if (!channel) return;

    const leaderboardEmbed = new EmbedBuilder()
        .setTitle("Leaderboards");
    const leaderboards = await Promise.all([
            alltimeWinrate(client, guild),
            matchesPlayed(client, guild),
            topLebaneseMentalHealthCounselor(client, guild)
        ]);
        leaderboards.forEach(board => {
        leaderboardEmbed.addFields(board);
    }); 

    const leaderboardMessage = {
        content : "# Leaderboards",
        embeds : [leaderboardEmbed],
    }  

    channel.messages.fetch().then((messages) => {
    if(messages.size === 0) {
        channel.send(leaderboardMessage);
        log("sendLeaderboardMessage.js", "Send initial leaderboard message.");
    } else {
        for(message of messages) {
            message[1].edit(leaderboardMessage)
            log("updateLeaderboard.js", `Edited leaderboard message in guild ${guild.name}`);
        }
    }
    });
    process.exit;
}