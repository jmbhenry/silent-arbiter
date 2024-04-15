const log = require("../../utils/log.js");
const { Op, Sequelize } = require('sequelize');
const { MatchResult, DraftResult} = require("../../dbObjects.js")
const Player = require("../../models/PlayerClass.js")

module.exports = async (client, guild, matchNumber) => {
    log("last50matchesWinrate.js","Updating last 50 matches leaderboard");

    let matches = await MatchResult.findAll({ 
        where: {
            [Op.and] : {
                [Op.not]: {result: "unplayed"},
                '$DraftResult.guild_id$': guild.id,
            }
        },
        include: DraftResult
    });

    matches.sort((m1, m2) => {
        return m2.createdAt - m1.createdAt;
    });

    let map = new Map();
    matches.forEach(match => {
        map.get(match.redPlayer) ?? map.set(match.redPlayer, new Player(match.redPlayer));
        map.get(match.bluePlayer) ?? map.set(match.bluePlayer, new Player(match.bluePlayer));

        if(match.result == "red") {
            if(map.get(match.redPlayer).numberOfMatches() < matchNumber) { map.get(match.redPlayer).wins++;}
            if(map.get(match.bluePlayer).numberOfMatches() < matchNumber) { map.get(match.bluePlayer).losses++;}
        } else if (match.result == "blue") {
            if(map.get(match.redPlayer).numberOfMatches() < matchNumber) { map.get(match.redPlayer).losses++;}
            if(map.get(match.bluePlayer).numberOfMatches() < matchNumber) { map.get(match.bluePlayer).wins++;}
        }
    });

    let leaderboard = Array.from(map.values()).filter(player => {
            return player.wins+player.losses>=matchNumber;
    });

    leaderboard.sort((p1, p2) => {
        return p2.winrate()-p1.winrate();
    });

    return leaderboard.map( player => {
        return {id: player.id, score: player.winrate().toFixed(1), suffix: "%"}
    });
}