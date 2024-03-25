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
const log = require("../../utils/log.js");

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

  log("queue.js", "Sending queue message");
  await interaction.reply({
    content: "Starting a draft. Click on the button to join the queue.",
  });
  const queueMessage = await interaction.channel.send({
    content: `Team Formation: ${draft.teamFormation}`,
    components: [buttonsRow],
  });
  draft.link = queueMessage;

  log("queue.js", "Starting up queue");
  //Waiting for queue to fill up
  
  while (draft.status === "queue") {
    const buttonClickedInteraction = await queueMessage
      .awaitMessageComponent({
        time: 3_600_000,
      })
      .catch(async (error) => {
        draft.status = "cancelled";
        await queueMessage.edit({
          content: "Draft timed out without firing after 1h without activity.",
          components: [],
        });
      });
    if (!buttonClickedInteraction) return;
    switch (buttonClickedInteraction.customId) {
      //Click on Join button
      case "join":
        log("queue.js", `Join button clicked by ${buttonClickedInteraction.member.displayName}`);
        if (draft.players.length >= DRAFT_QUEUE_MAX_SIZE) {
          buttonClickedInteraction.reply({
            content: "The draft is full, sorry",
            ephemeral: true,
          });
        } else if (
          draft.players.find(
            (player) => player.id === buttonClickedInteraction.member.id
          )
        ) {
          buttonClickedInteraction.reply({
            content: "You are already in this draft!",
            ephemeral: true,
          });
        } else {
          draft.players.push(buttonClickedInteraction.member);
          log("queue.js", `User ${buttonClickedInteraction.member.displayName} joined the queue`);
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
        log("queue.js", `Leave button clicked by ${buttonClickedInteraction.member.displayName}`);
        const index = draft.players.findIndex(
          (player) => player.id === buttonClickedInteraction.member.id
        );
        if (index > -1) {
          draft.players.splice(index, 1);
          log("queue.js", `User ${buttonClickedInteraction.member.displayName} left the queue`);
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
        log("queue.js", `${buttonClickedInteraction.member.displayName} clicked on Start the draft`);
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
          log(
            "queue.js",
            `${buttonClickedInteraction.member.displayName} started the draft`
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
        log("queue.js", `${buttonClickedInteraction.member.displayName} clicked on cancelled the draft`);
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
