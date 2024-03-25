const guildEnv = require("../guildEnv.js");

/**
 * @param {ChatInputCommandInteraction} interaction
 * @param {Draft} draft
 */
module.exports = (interaction, draft) => {
  const botAdmin = guildEnv(interaction.guildId).BOT_ADMIN_ROLE;

  let permission = true;
    if (
    !(
      interaction.member.id === draft.leader.id ||
      interaction.member.roles.cache.has(botAdmin)
    )
  ) {
    interaction.reply({
      content: `Only the user who created the draft or ${interaction.guild.roles.resolve(botAdmin)} can use this button`,
      ephemeral: true,
    });
    permission = false;
  }
  return permission;
};
