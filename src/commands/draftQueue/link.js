const { Client, ChatInputCommandInteraction, ApplicationCommandOptionType} = require("discord.js");
const log = require("../../utils/log.js");

module.exports = {
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
     * @param {Map} ongoingDrafts
     */
    callback: async(client, interaction, ongoingDrafts) => {
        log("link.js", `link command called by ${interaction.member.displayName} in ${interaction.channel.name}`);

        let draft = ongoingDrafts.get(interaction.channelId);
        if(!draft || !(draft.link)) {
            interaction.reply({
                content: "There is no ongoing draft in this channel.",
                ephemeral: true,
              });
            return;
        }
        else {
            interaction.reply({
                content: `${draft.link.url}`,
              });
            return;
        }
    },
    name: "link",
    description: "If there is a draft happening in this channel,the bot will post a link to the queue or pairings.",
}