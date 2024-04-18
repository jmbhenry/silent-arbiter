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
        /* Sort from most recent to oldest for rolling winrate calculation */
        matches.sort((m1, m2) => {
            return m2.createdAt - m1.createdAt;
        });    
        /* If head to head */
        if(otherPlayerId) {
            matches = matches.filter(match => {
                return (match.bluePlayer == otherPlayerId) || (match.redPlayer == otherPlayerId);
            });
        };
        /* Calculate match winrate */
        let matchWinsAllTime = 0;
        let matchLossesAllTime = 0;
        let matchWinsYearly = 0;
        let matchLossesYearly = 0;
        const YEARLY_START_DATE = new Date(1704085200000);
        const YEARLY_END_DATE = new Date(1735707599000);
        let matchWinsMontly = 0;
        let matchLossesMonthly = 0;
        const MONTHLY_START_DATE = new Date(1711944000000);
        const MONTHLY_END_DATE = new Date(1714535999000);
        let rollingWins = 0;
        let rollingLosses = 0;
        const ROLLING_MAX = 50;
        matches.forEach(match => {
            if(match.redPlayer == interaction.member.id) {
                if(match.result == "red") {
                    if(match.createdAt > YEARLY_START_DATE && match.createdAt < YEARLY_END_DATE)
                        matchWinsYearly++;
                    if(match.createdAt > MONTHLY_START_DATE && match.createdAt < MONTHLY_END_DATE)
                        matchWinsMontly++;
                    if(rollingWins+rollingLosses<ROLLING_MAX)
                        rollingWins++;
                    matchWinsAllTime++;
                }
                else if (match.result == "blue") {
                    if(match.createdAt > YEARLY_START_DATE && match.createdAt < YEARLY_END_DATE)
                        matchLossesYearly++;
                    if(match.createdAt > MONTHLY_START_DATE && match.createdAt < MONTHLY_END_DATE)
                        matchLossesMonthly++;
                    if(rollingWins+rollingLosses<ROLLING_MAX)
                        rollingLosses++;
                    matchLossesAllTime++;
                }
            }
            else if(match.bluePlayer == interaction.member.id) {
                if(match.result == "blue") {
                    if(match.createdAt > YEARLY_START_DATE && match.createdAt < YEARLY_END_DATE)
                        matchWinsYearly++;
                    if(match.createdAt > MONTHLY_START_DATE && match.createdAt < MONTHLY_END_DATE)
                        matchWinsMontly++;
                    if(rollingWins+rollingLosses<ROLLING_MAX)
                        rollingWins++;
                    matchWinsAllTime++;
                }
                else if (match.result == "red") {
                    if(match.createdAt > YEARLY_START_DATE && match.createdAt < YEARLY_END_DATE)
                        matchLossesYearly++;
                    if(match.createdAt > MONTHLY_START_DATE && match.createdAt < MONTHLY_END_DATE)
                        matchLossesMonthly++;
                    if(rollingWins+rollingLosses<ROLLING_MAX)
                        rollingLosses++;
                    matchLossesAllTime++;
                }
            }
        });
        const otherPlayer = await interaction.guild.members.fetch(otherPlayerId);
        let recordReply;
        const winrateAllTime = ((matchWinsAllTime/(matchWinsAllTime+matchLossesAllTime))*100).toFixed();
        const winrateYearly = ((matchWinsYearly/(matchWinsYearly+matchLossesYearly))*100).toFixed();
        const winrateMonthly = ((matchWinsMontly/(matchWinsMontly+matchLossesMonthly))*100).toFixed();
        const winrateRolling = ((rollingWins/(rollingWins+rollingLosses))*100).toFixed();
        if(!otherPlayerId){
            recordReply = `Your all-time match record is ${matchWinsAllTime} wins and ${matchLossesAllTime} losses. Winrate: ${winrateAllTime}%.`;
            recordReply += `\nYour 2024 match record is ${matchWinsYearly} wins and ${matchLossesYearly} losses. Winrate: ${winrateYearly}%.`;
            recordReply += `\nYour april match record is ${matchWinsMontly} wins and ${matchLossesMonthly} losses. Winrate: ${winrateMonthly}%.`;
            recordReply += `\nYour rolling last 50 matches record is ${rollingWins} wins and ${rollingLosses} losses. Winrate: ${winrateRolling}%.`;
        } else {
            recordReply = `In head to head matches against ${otherPlayer.displayName}, you have ${matchWinsAllTime} wins to ${matchLossesAllTime} losses. Winrate: ${winrateAllTime}%.`;
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