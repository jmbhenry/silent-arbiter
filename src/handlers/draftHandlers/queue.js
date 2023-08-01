const { EmbedBuilder } = require("discord.js");
const formatPlayerList = require("../../utils/formatPlayerList.js");

const DRAFT_MIN_SIZE = 1;
const DRAFT_QUEUE_MAX_SIZE = 8;

module.exports = async (message) => {

  let draftCanceled = false;
  let draftStarted = false;
  let players = [];
  
  //Waiting for queue to fill up
  console.log("Starting up queue");
  while (!draftCanceled && !draftStarted) {
    const buttonClicked = await message
      .awaitMessageComponent({
        time: 600000,
      })
      .catch(async (error) => {
        players = [];
        await message.edit({
          content: "Draft timed out without firing.",
          embeds: [],
          components: [],
        });
      });
    if (!buttonClicked) return;

    //Click on Join button
    if (buttonClicked.customId === "Join queue") {
      if (players.length >= DRAFT_QUEUE_MAX_SIZE) {
        await buttonClicked.reply({
          content: "The draft is full, sorry",
          ephemeral: true,
        });
      } else if (
        players.find((player) => player.id === buttonClicked.user.id)
      ) {
        await buttonClicked.reply({
          content: "You are already in this draft!",
          ephemeral: true,
        });
      } else {
        players.push(buttonClicked.user);
        console.log(`User ${buttonClicked.user.username} joined the queue`);
        await message.edit({
          embeds: [
            new EmbedBuilder()
              .setTitle("Players")
              .setDescription(formatPlayerList(players)),
          ],
        });
        await buttonClicked.reply({
          content: "Joined the draft!",
          ephemeral: true,
        });
      }
    }
    // Click on Leave button
    else if (buttonClicked.customId === "Leave queue") {
      const index = players.findIndex(
        (player) => player.id === buttonClicked.user.id
      );
      if (index > -1) {
        players.splice(index, 1);
        console.log(`User ${buttonClicked.user.username} left the queue`);
        await message.edit({
          embeds: [
            new EmbedBuilder()
              .setTitle("Players")
              .setDescription(formatPlayerList(players)),
          ],
        });
        await buttonClicked.reply({
          content: "You left the draft.",
          ephemeral: true,
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
      console.log(`${buttonClicked.user.username} cancelled the draft`)
      await message.edit({
        content: "Draft cancelled",
        embeds: [],
        components: [],
      });
      await buttonClicked.reply({
        content: "You cancelled the draft.",
        ephemeral: true,
      });
      players = [];
      draftCanceled = true;
    }
    // Click on Start button
    else if (buttonClicked.customId === "Start draft") {
      console.log(`${buttonClicked.user.username} clicked on Start the draft`)
      if (players.length < DRAFT_MIN_SIZE) {
        await buttonClicked.reply({
          content:
            `Not enough players to start the draft, you need at least ${DRAFT_MIN_SIZE} players to start.`,
          ephemeral: true,
        });
      } else if (players.length % 2 != 0) {
        await buttonClicked.reply({
          content: "You need an even amount of players to start a draft",
          ephemeral: true,
        });
      } else {
        console.log(`${buttonClicked.user.username} started the draft`)
        draftStarted = true;
        await buttonClicked.reply({
          content: "Starting draft.",
          ephemeral: true,
        });
      }
    }
  }
  return players;
};
