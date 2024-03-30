const {EmbedBuilder} = require("discord.js");
const log = require("../../utils/log.js");
const { Op, Sequelize } = require('sequelize');
const { MatchResult, DraftResult} = require("../../dbObjects.js")
const Player = require("../../models/PlayerClass.js")

const LEADERBOARD_MAX_SIZE = 10;
const MIN_MATCHES = 3;
const ELI = "290845533457612812";

module.exports = async (client, guild) => {
    log("alltimeWinrate.js","Updating All Time Winrate Leaderboard.");

    let matches = await MatchResult.findAll({ 
        where: {
            [Op.and] : {
                [Op.not]: {result: "unplayed"},
                '$DraftResult.guild_id$': guild.id,
                [Op.or]: {
                    bluePlayer: ELI,
                    redPlayer: ELI
                }
            }
        },
        include: DraftResult
    });

    let eliPlayer = new Player(ELI);
    matches.forEach(match => {
        if(match.redPlayer == ELI) {
            match.result == "red" ? eliPlayer.wins++ : eliPlayer.losses++;
        }
        else if(match.bluePlayer == ELI) {
            match.result == "blue" ? eliPlayer.wins++ : eliPlayer.losses++;
        }
    });
    let leaderboard = [eliPlayer];
    let formattedLeaderboardText = "---\n";
    for (let i = 0; i< LEADERBOARD_MAX_SIZE; i++) {
        formattedLeaderboardText += `${i+1}.`;
        if(i<leaderboard.length) {
            const playerName = await guild.members.fetch(leaderboard[i].id);
            formattedLeaderboardText += ` ${playerName} - ${leaderboard[i].winrate().toPrecision(2)}%`;
        }
        formattedLeaderboardText += `\n`;
    };

    return { name:"Top Lebanese Mental Health Counselor", value: formattedLeaderboardText, inline:true};
}