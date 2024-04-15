const log = require("../../utils/log.js");
const { Op, Sequelize } = require('sequelize');
const { MatchResult, DraftResult} = require("../../dbObjects.js")
const Player = require("../../models/PlayerClass.js")

module.exports = async (client, guild, minMatches = 0, startDate = new Date(0), endDate = new Date(4868827482000)) => {
    log("2024Winrate.js","Updating All Time Winrate Leaderboard.");

    let matches = await MatchResult.findAll({ 
        where: {
            [Op.and] : {
                [Op.not]: {result: "unplayed"},
                '$DraftResult.guild_id$': guild.id,
                createdAt: {
                    [Op.lt]: endDate,
                    [Op.gt]: startDate,
                  }
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
        return player.wins+player.losses>=minMatches;
    });
    leaderboard.sort((p1, p2) => {
        return p2.winrate()-p1.winrate();
    });

    return leaderboard.map( player => {
        return {id: player.id, score: player.winrate().toFixed(1), suffix: "%"}
    });
}