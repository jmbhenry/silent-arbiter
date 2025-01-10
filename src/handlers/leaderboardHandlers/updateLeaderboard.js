const guildEnv = require("../../guildEnv.js");
const log = require("../../utils/log.js");
const { EmbedBuilder } = require("@discordjs/builders");
const matchesPlayed = require("../../handlers/leaderboardHandlers/matchesPlayed.js");
const rollingWinrate = require("./rollingWinrate.js");
const winrate = require("../../handlers/leaderboardHandlers/winrate.js");



module.exports = async(client, guild) => {
    const ge = guildEnv(guild.id);
    const channel = await client.channels.cache.get(ge.LEADERBOARD_CHANNEL);
    if (!channel) return;

    const leaderboardEmbed = new EmbedBuilder();
    const leaderboards = await Promise.all([
            formatLeaderboard("Winrate in 2024", winrate(client, guild, 50, new Date(1704085200000), new Date(1735707599000)), guild, 10, "min 50 matches"),
            formatLeaderboard("Winrate in 2025", winrate(client, guild, 50, new Date(1735707600000), new Date(1767243599000)), guild, 10, "min 50 matches"),
            formatLeaderboard("Winrate over last 50 matches", rollingWinrate(client, guild, 50), guild, 10, "min 50 matches"),
            formatLeaderboard("Matches played", matchesPlayed(client, guild), guild, 10),
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

async function formatLeaderboard(name, leaderboardPromise, guild, length, comment) {
    let entries = await leaderboardPromise;
    let formattedLeaderboardText=`${comment ?? "-"}\n`;
    let i = 1;
    let j = 0;
    while (i<=length) {
        if(j >= entries.length) {
            formattedLeaderboardText += `${i}.\n`;
            i++;
        } else {
            let entry = entries[j];
            await guild.members.fetch(entry.id)
            .then( playerName => {
                formattedLeaderboardText += `${i}. ${playerName} - ${entry.score}${entry.suffix}\n`;
                i++;
            })
            .catch( error => {
                /* Handling users that have left the server. */
                log(`updateLeaderboard.js`, error);
            });
        }
        j++;
    };

    return {name: name, value: formattedLeaderboardText, inline: true};
}