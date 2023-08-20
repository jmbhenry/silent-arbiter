const {Client, Interaction} = require("discord.js");
const guildEnv = require("../../guildEnv.js");


/**
 * @param {Client} client
 * @param {Interaction} interaction
 */
module.exports = async (client, interaction) => {
    try {
        if(!interaction.isButton()) return;
        if(interaction.channelId != guildEnv(interaction.guildId).ROLE_CHANNEL) return;

        await interaction.deferReply({
            ephemeral: true
        });

        const role = interaction.guild.roles.cache.get(interaction.customId);
        if (!role) {
            interaction.editReply({
                content: "I couldn't find that role",
            })
            return;
        }

        const hasRole = interaction.member.roles.cache.has(role.id)

        if(hasRole) {
            await interaction.member.roles.remove(role);
            await interaction.editReply({ content: `You are no longer a ${role}.`});
            return;
        }

        await interaction.member.roles.add(role);
        await interaction.editReply({ content: `You are now a ${role}!`});
    } catch (error) {
        console.log(`Error in roleAssignment: ${error}`);
    }
}