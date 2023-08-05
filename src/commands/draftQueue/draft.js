const { Client, ChatInputCommandInteraction } = require("discord.js");
const queue = require("../../handlers/draftHandlers/queue.js");
const teamFormation = require("../../handlers/draftHandlers/teamFormation.js");
const Draft = require("../../models/draftClass.js");
const pairings = require("../../handlers/draftHandlers/pairings.js");
const CUBE_CHANNEL = "1133249799186030673";
const CURRENT_SET_CHANNEL = "1133249838469873714";

const DRAFT_CHANNELS = [CUBE_CHANNEL, CURRENT_SET_CHANNEL];

module.exports = {
  /**
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  callback: async (client, interaction) => {
    try {
      let draft = new Draft();

      await queue(interaction, draft);

      if (draft.status === "cancelled") {
        console.log("Draft cancelled");
        return;
      }
      console.log(
        `Starting team formation with ${draft.players.length} players`
      );
      await teamFormation(interaction.channel, draft);
      console.log("Teams formed successfully");
      await pairings(interaction.channel, draft);
      console.log(`pairings completed`);
      if (draft.status === "finished") {
        await interaction.channel.send({
          content: "You completed the draft!",
        });
      }

      return;
    } catch (error) {
      console.log("Error with draft command");
      console.error(error);
    }
  },
  name: "draft",
  description: "Start a draft!",
};
