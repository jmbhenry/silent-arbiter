const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const formatPlayerList = require("../../utils/formatPlayerList.js");
const Draft = require("../../models/draftClass.js");
const DRAFT_MIN_SIZE = 2;
const DRAFT_QUEUE_MAX_SIZE = 8;

const queueButtons = [
  { name: "Join queue", style: ButtonStyle.Primary, disabled: false },
  { name: "Leave queue", style: ButtonStyle.Secondary, disabled: false },
  { name: "Start draft", style: ButtonStyle.Success, disabled: false },
  { name: "Cancel draft", style: ButtonStyle.Danger, disabled: false },
];

/**
 * @param {ChatInputCommandInteraction} interaction
 * @param {Draft} draft
 */
module.exports = async (interaction, draft) => {
  draft.status = "queue";

  const buttons = queueButtons.map((defaultButton) => {
    return new ButtonBuilder()
      .setCustomId(defaultButton.name)
      .setLabel(defaultButton.name)
      .setStyle(defaultButton.style)
      .setDisabled(defaultButton.disabled);
  });

  const buttonsRow = new ActionRowBuilder().addComponents(buttons);

  const queueMessage = await interaction.reply({
    content: "Starting a draft. Click on the button to join the queue",
    components: [buttonsRow],
  });

  console.log("Starting up queue");
  //Waiting for queue to fill up
  while (draft.status === "queue") {
    const buttonClicked = await queueMessage
      .awaitMessageComponent({
        time: 600000,
      })
      .catch(async (error) => {
        await queueMessage.edit({
          content: "Draft timed out without firing.",
          embeds: [],
          components: [],
        });
      });
    if (!buttonClicked) return;

    //Click on Join button
    if (buttonClicked.customId === "Join queue") {
      if (draft.players.length >= DRAFT_QUEUE_MAX_SIZE) {
        await buttonClicked.reply({
          content: "The draft is full, sorry",
          ephemeral: true,
        });
      } else if (
        draft.players.find((player) => player.id === buttonClicked.user.id)
      ) {
        await buttonClicked.reply({
          content: "You are already in this draft!",
          ephemeral: true,
        });
      } else {
        draft.players.push(buttonClicked.user);
        console.log(`User ${buttonClicked.user.username} joined the queue`);
        await buttonClicked.update({
          embeds: [
            new EmbedBuilder()
              .setTitle("Players")
              .setDescription(formatPlayerList(draft.players)),
          ],
        });
      }
    }
    // Click on Leave button
    else if (buttonClicked.customId === "Leave queue") {
      const index = draft.players.findIndex(
        (player) => player.id === buttonClicked.user.id
      );
      if (index > -1) {
        draft.players.splice(index, 1);
        console.log(`User ${buttonClicked.user.username} left the queue`);
        await buttonClicked.update({
          embeds: [
            new EmbedBuilder()
              .setTitle("Players")
              .setDescription(formatPlayerList(draft.players)),
          ],
        });
      } else {
        await buttonClicked.reply({
          content: "You are not in this draft!",
          ephemeral: true,
        });
      }
    }
    // Click on Cancel button
    else if (buttonClicked.customId === "Cancel draft") {
      console.log(`${buttonClicked.user.username} cancelled the draft`);
      await buttonClicked.update({
        content: "Draft cancelled",
        components: [],
      });
      draft.status = "cancelled";
    }
    // Click on Start button
    else if (buttonClicked.customId === "Start draft") {
      console.log(`${buttonClicked.user.username} clicked on Start the draft`);
      if (draft.players.length < DRAFT_MIN_SIZE) {
        await buttonClicked.reply({
          content: `Not enough players to start the draft, you need at least ${DRAFT_MIN_SIZE} players to start.`,
          ephemeral: true,
        });
      } else if (draft.players.length % 2 != 0) {
        await buttonClicked.reply({
          content: "You need an even amount of players to start a draft",
          ephemeral: true,
        });
      } else {
        draft.status = "started";
        console.log(`${buttonClicked.user.username} started the draft`);
        await buttonClicked.update({
          content: "Draft started. Look below for team formation.",
          components: [],
        });
      }
    }
  }
  return;
};
