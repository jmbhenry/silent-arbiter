const log = require("../../utils/log.js");
const { Op, Sequelize } = require('sequelize');
const { MatchResult, DraftResult} = require("../../dbObjects.js")
const Player = require("../../models/PlayerClass.js")

const LEADERBOARD_MAX_SIZE = 10;
const MIN_MATCHES = 20;

module.exports = async (client, guild) => {
    log("alltimeWinrate.js","Updating All Time Winrate Leaderboard.");

    let matches = await MatchResult.findAll({ 
        where: {
            [Op.and] : {
                [Op.not]: {result: "unplayed"},
                '$DraftResult.guild_id$': guild.id,
            }
        },
        include: DraftResult
    });

    let map = new Map();
    matches.forEach(match => {
        map.get(match.redPlayer) ?? map.set(match.redPlayer, new Player(match.redPlayer));
        map.get(match.bluePlayer) ?? map.set(match.bluePlayer, new Player(match.bluePlayer));

        if(match.result == "red") {
            map.get(match.redPlayer).wins++;
            map.get(match.bluePlayer).losses++;
        } else if (match.result == "blue") {
            map.get(match.bluePlayer).wins++;
            map.get(match.redPlayer).losses++;
        }
    });

    let leaderboard = Array.from(map.values()).filter(player => {
        return player.wins+player.losses>=MIN_MATCHES;
    });
    leaderboard.sort((p1, p2) => {
        return p2.winrate()-p1.winrate();
    });

    let formattedLeaderboardText = "---\n";
    for (let i = 0; i<LEADERBOARD_MAX_SIZE; i++) {
        formattedLeaderboardText += `${i+1}.`;
        if(i<leaderboard.length) {
            await guild.members.fetch(leaderboard[i].id)
            .then( playerName => {
                formattedLeaderboardText += ` ${playerName} - ${leaderboard[i].winrate().toFixed()}%`;
            })
            .catch( error => {
                log(`allTimeWinrate.js`, error);
                log(`allTimeWinrate.js`, `User ${leaderboard[i].id} not found`);
                formattedLeaderboardText += ` UNDEFINED - ${leaderboard[i].winrate().toFixed()}%`;
            });
        }
        formattedLeaderboardText += `\n`;
    };

    return {name: "All-time winrate", value: formattedLeaderboardText, inline: true};
}