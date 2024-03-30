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
        log("record-draft.js", `Record command called by ${interaction.member.displayName} in ${interaction.channel.name}`);
        const playerId = interaction.member.id;
        let isEphemeral = interaction.options.get("public")?.value ? interaction.options.get("public").value : true
        await interaction.deferReply({ ephemeral: isEphemeral });
        
        let playedMatches = await MatchResult.findAll({
            where: {
                [Op.and] : [
                    {
                        [Op.or]: [
                            {redPlayer: playerId},
                            {bluePlayer: playerId},
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
        console.log(interaction.options.get("public"));
        let wins=0, losses=0, draws=0;
        playedMatches.forEach(match => {
            if(match.draftResult.result == "draw")
                draws++;
            else if(match.draftResult.result == "red")
                match.redPlayer == playerId ? wins++ : losses++;
            else if(match.draftResult.result == "blue")
                match.bluePlayer == playerId ? wins++ : losses++;
        });
        await interaction.editReply({
            content:  `${interaction.member.displayName}'s draft record is ${wins} wins, ${losses} losses and ${draws} draws.`,
        });
        return;
    },
    name: "record-draft",
    description: "Consult your draft record",
    options: [
        {
            name: "public",
            description: "Choose if the result of the command will be visible by everyone.",
            type: ApplicationCommandOptionType.Boolean,
            default: false
        },
    ]
};