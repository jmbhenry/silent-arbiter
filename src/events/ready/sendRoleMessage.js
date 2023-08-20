const {
  Client,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");
const guildEnv = require("../../guildEnv.js");
/**
 * @param {Client} client
 */
module.exports = async (client) => {
  try {
    client.guilds.cache.forEach(async (guild) => {
      const ge = guildEnv(guild.id);
      const channel = await client.channels.cache.get(ge.ROLE_CHANNEL);    
      if (!channel) return;
      const roles = ge.OPT_IN_ROLES;
      if (!roles || roles.length < 1) return;
      const row = new ActionRowBuilder();
      let roleMessageText = `Opt in to the roles you want to by clicking the buttons below. To opt out of a role, just click that button again.\n`;
      roles.forEach((role) => {
        row.components.push(
          new ButtonBuilder()
            .setCustomId(role.id)
            .setLabel(role.label)
            .setStyle(role.style)
        );
        roleMessageText += `\n**${role.label}**\n${role.description}\n`;
      });

      channel.messages.fetch().then((messages) => {
        if(messages.size === 0) {
          channel.send({
            content : roleMessageText,
            components : [row]
          })
          console.log("Send initial role message.");
        } else {
          for(message of messages) {
            message[1].edit({
              content : roleMessageText, 
              components : [row]
            })
            console.log("Edited role message.");
          }
        }
      });
      process.exit
    });
  } catch (error) {
    console.log(`Error in sendRoleMessage: ${error}`);
  }
};
