const log = require("../../utils/log.js");
const { Op, Sequelize } = require('sequelize');
const { MatchResult, DraftResult} = require("../../dbObjects.js")
const Player = require("../../models/PlayerClass.js")

const LEADERBOARD_MAX_SIZE = 10;
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

    return [{id: ELI, score: eliPlayer.winrate().toFixed(1), suffix:"%"}];
}