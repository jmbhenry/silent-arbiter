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
        const otherPlayerId = interaction.options.get("head-to-head") ? interaction.options.get("head-to-head").value : null;
        const public = interaction.options.get("public")?.value;
        console.log(public);
        await interaction.deferReply({ ephemeral: !public});
        
        let matches = await MatchResult.findAll({
            where: {
                [Op.or]: [
                    {redPlayer: interaction.member.id},
                    {bluePlayer: interaction.member.id},
                ]
            },
            include: DraftResult
        });
        /* If head to head */
        if(otherPlayerId) {
            matches = matches.filter(match => {
                return (match.bluePlayer == otherPlayerId) || (match.redPlayer == otherPlayerId);
            });
        };
        /* Calculate match winrate */
        let matchWins = 0;
        let matchLosses = 0;
        matches.forEach(match => {
            if(match.redPlayer == interaction.member.id) {
                if(match.result == "red")
                    matchWins++;
                else if (match.result == "blue")
                    matchLosses++;
            }
            else if(match.bluePlayer == interaction.member.id) {
                if(match.result == "blue")
                    matchWins++;
                else if (match.result == "red")
                    matchLosses++;
            }
        });
        const otherPlayer = await interaction.guild.members.fetch(otherPlayerId);
        let recordReply;
        const winrate = ((matchWins/(matchWins+matchLosses))*100).toFixed();
        if(!otherPlayerId){
            recordReply = `Your match record is ${matchWins} wins and ${matchLosses} losses. Winrate: ${winrate}%.`;
        } else {
            recordReply = `In head to head matches against ${otherPlayer.displayName}, you have ${matchWins} wins to ${matchLosses} losses. Winrate: ${winrate}%.`;
        }
        /* Calculate draft winrate */
        let matchesGroupedByDraft = await MatchResult.findAll({
            where: {
                [Op.and] : [
                    {
                        [Op.or]: [
                            {redPlayer: interaction.member.id},
                            {bluePlayer: interaction.member.id},
                        ]
                    },
                    {
                        [Op.not]: {result: "unplayed"}
                    }
                ]
            },
            group: 'draftResultId',
            include: DraftResult
        });
        let draftWins=0, draftLosses=0, draftDraws=0;
        matchesGroupedByDraft.forEach(match => {
            if(match.draftResult.result == "draw")
                draftDraws++;
            else if(match.draftResult.result == "red")
                match.redPlayer == interaction.member.id ? draftWins++ : draftLosses++;
            else if(match.draftResult.result == "blue")
                match.bluePlayer == interaction.member.id ? draftWins++ : draftLosses++;
        });
        if(!otherPlayerId){
            recordReply+=`\nYour draft record is ${draftWins} wins, ${draftLosses} losses and ${draftDraws} draws.`;
        }
        await interaction.editReply({
            content: recordReply
        });
        return;
    },
    name: "record",
    description: "Consult your match and draft record",
    options: [
        {
            name: 'head-to-head',
            description: "The other player in the head to head record you're consulting.",
            type: ApplicationCommandOptionType.User,
        },
        {
            name: "public",
            description: "Choose if the result of the command will be visible by everyone.",
            type: ApplicationCommandOptionType.Boolean,
            default: false
        },
    ]
};