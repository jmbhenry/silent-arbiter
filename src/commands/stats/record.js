const { Client, ChatInputCommandInteraction, ApplicationCommandOptionType} = require("discord.js");
const log = require("../../utils/log.js");
const { Op } = require('sequelize');
const { DraftResult, MatchResult} = require("../../dbObjects.js")

module.exports = {
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
     */
    callback: async(client, interaction) => {
        log("record.js", `Record command called by ${interaction.member.displayName} in ${interaction.channel.name}`);
        const playerId = interaction.options.get("player") ? interaction.options.get("player").value : interaction.member.id;
        const secondPlayerId = interaction.options.get("second-player") ? interaction.options.get("second-player").value : null;
        await interaction.deferReply()
        
        let matches = await MatchResult.findAll({
            where: {
                [Op.or]: [
                    {redPlayer: playerId},
                    {bluePlayer: playerId},
                ]
            }
        });
        if(secondPlayerId) {
            matches = matches.filter(match => {
                return (match.bluePlayer == secondPlayerId) || (match.redPlayer == secondPlayerId);
            });
        };
        let wins = 0;
        let losses = 0;
        matches.forEach(match => {
            if(match.redPlayer == playerId) {
                if(match.result == "red")
                    wins++;
                else if (match.result == "blue")
                    losses++;
            }
            else if(match.bluePlayer == playerId) {
                if(match.result == "blue")
                    wins++;
                else if (match.result == "red")
                    losses++;
            }
        });
        const player = await interaction.guild.members.fetch(playerId);
        const secondPlayer = await interaction.guild.members.fetch(secondPlayerId);
        let recordReply;
        if(!secondPlayerId){
            recordReply = `${player.displayName}'s match record is ${wins} wins and ${losses} losses. Winrate: ${(Number.parseFloat((wins/(wins+losses))*100).toFixed(2))}%.`;
        } else {
            recordReply = `In head to head matches, ${player.displayName} has ${wins} wins to ${losses} losses against ${secondPlayer.displayName}.`;
        }
        await interaction.editReply({
            content: recordReply
        });
        return;
    },
    name: "record",
    description: "Consult your match record",
    options: [
        {
            name: 'player',
            description: "The player whose record you're consulting.",
            type: ApplicationCommandOptionType.User,
        },
        {
            name: 'second-player',
            description: "The second player in the head to head record you're consulting.",
            type: ApplicationCommandOptionType.User,
        },
    ]
};
