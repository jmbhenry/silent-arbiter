const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const formatPlayerList = require("../../utils/formatPlayerList.js");
const buttonPermissionCheck = require("../../utils/buttonPermissionCheck.js");
const Draft = require("../../models/draftClass.js");
const DRAFT_MIN_SIZE = 6;
const DRAFT_QUEUE_MAX_SIZE = 8;

const queueButtons = [
  {
    id: "join",
    name: "Join queue",
    style: ButtonStyle.Primary,
    disabled: false,
  },
  {
    id: "leave",
    name: "Leave queue",
    style: ButtonStyle.Secondary,
    disabled: false,
  },
  {
    id: "start",
    name: "Start draft",
    style: ButtonStyle.Success,
    disabled: false,
  },
  {
    id: "cancel",
    name: "Cancel draft",
    style: ButtonStyle.Danger,
    disabled: false,
  },
];

/**
 * @param {ChatInputCommandInteraction} interaction
 * @param {Draft} draft
 */
module.exports = async (interaction, draft) => {
  const buttons = queueButtons.map((defaultButton) => {
    return new ButtonBuilder()
      .setCustomId(defaultButton.id)
      .setLabel(defaultButton.name)
      .setStyle(defaultButton.style)
      .setDisabled(defaultButton.disabled);
  });

  const buttonsRow = new ActionRowBuilder().addComponents(buttons);

  console.log("Sending queue message");
  const queueMessage = await interaction.reply({
    content: "Starting a draft. Click on the button to join the queue",
    components: [buttonsRow],
  });

  console.log("Starting up queue");
  //Waiting for queue to fill up

  while (draft.status === "queue") {
    const buttonClickedInteraction = await queueMessage
      .awaitMessageComponent({
        time: 855_000,
      })
      .catch(async (error) => {
        draft.status = "cancelled";
        await queueMessage.edit({
          content: "Draft timed out without firing after 15min without activity.",
          components: [],
        });
      });
    if (!buttonClickedInteraction) return;
    switch (buttonClickedInteraction.customId) {
      //Click on Join button
      case "join":
        console.log(`Joined button clicked by ${buttonClickedInteraction.user.username}`);
        if (draft.players.length >= DRAFT_QUEUE_MAX_SIZE) {
          buttonClickedInteraction.reply({
            content: "The draft is full, sorry",
            ephemeral: true,
          });
        } else if (
          draft.players.find(
            (player) => player.id === buttonClickedInteraction.user.id
          )
        ) {
          buttonClickedInteraction.reply({
            content: "You are already in this draft!",
            ephemeral: true,
          });
        } else {
          draft.players.push(buttonClickedInteraction.user);
          console.log(`User ${buttonClickedInteraction.user.username} joined the queue`);
          await buttonClickedInteraction.update({
            embeds: [
              new EmbedBuilder()
                .setTitle("Players")
                .setDescription(formatPlayerList(draft.players)),
            ],
          });
        }
        break;
      // Click on Leave button
      case "leave":
        console.log(`Leave button clicked by ${buttonClickedInteraction.user.username}`);
        const index = draft.players.findIndex(
          (player) => player.id === buttonClickedInteraction.user.id
        );
        if (index > -1) {
          draft.players.splice(index, 1);
          console.log(`User ${buttonClickedInteraction.user.username} left the queue`);
          await buttonClickedInteraction.update({
            embeds: [
              new EmbedBuilder()
                .setTitle("Players")
                .setDescription(formatPlayerList(draft.players)),
            ],
          });
        } else {
          buttonClickedInteraction.reply({
            content: "You are not in this draft!",
            ephemeral: true,
          });
        }
        break;
      //Click on Start button
      case "start":
        console.log(`${buttonClickedInteraction.user.username} clicked on Start the draft`);
        if (!buttonPermissionCheck(buttonClickedInteraction, draft)) break;
        if (draft.players.length < DRAFT_MIN_SIZE) {
          buttonClickedInteraction.reply({
            content: `Not enough players to start the draft, you need at least ${DRAFT_MIN_SIZE} players to start.`,
            ephemeral: true,
          });
        } else if (draft.players.length % 2 != 0) {
          buttonClickedInteraction.reply({
            content: "You need an even amount of players to start a draft",
            ephemeral: true,
          });
        } else {
          draft.status = "teamFormation";
          console.log(
            `${buttonClickedInteraction.user.username} started the draft`
          );
          await buttonClickedInteraction.update({
            content: "Draft started. Look below for team formation.",
            components: [],
          });
          return;
        }
        break;
      //Click on Cancel button
      case "cancel":
        console.log(`${buttonClickedInteraction.user.username} clicked on cancelled the draft`);
        if (!buttonPermissionCheck(buttonClickedInteraction, draft)) break;
        await buttonClickedInteraction.update({
          content: "Draft cancelled",
          components: [],
        });
        draft.status = "cancelled";
        return;
    }
  }
};
