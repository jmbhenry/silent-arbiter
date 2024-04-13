const {EmbedBuilder} = require("discord.js");
const log = require("../../utils/log.js");
const { Op, Sequelize } = require('sequelize');
const { MatchResult, DraftResult} = require("../../dbObjects.js")
const Player = require("../../models/PlayerClass.js")

module.exports = async (client, guild) => {
    log("matchesPlayed.js","Updating MatchesPlayed Leaderboard.");

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
        map.set(match.redPlayer, (map.get(match.redPlayer) ?? 0) + 1);
        map.set(match.bluePlayer, (map.get(match.bluePlayer) ?? 0) + 1);
    });

    let leaderboard = Array.from(map.entries());
    leaderboard.sort((p1, p2) => {
        return p2[1]-p1[1];
    });

    return leaderboard.map( player => {
        return {id: player[0], score: player[1], suffix: ""}
    });
}