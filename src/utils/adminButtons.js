const {
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} = require("discord.js");
module.exports = () => {
    const cancelButton = new ButtonBuilder()
    .setCustomId("cancel")
    .setLabel("Cancel Draft")
    .setStyle(ButtonStyle.Danger);

  const resetButton = new ButtonBuilder()
    .setCustomId("reset")
    .setLabel("Reset teams")
    .setStyle(ButtonStyle.Secondary);

  const adminRow = new ActionRowBuilder().addComponents(
    cancelButton,
    resetButton
  );

  return adminRow;
}