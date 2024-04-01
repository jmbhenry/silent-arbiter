const { Client, ChatInputCommandInteraction, ApplicationCommandOptionType} = require("discord.js");
const queue = require("../../handlers/draftHandlers/queue.js");
const teamFormation = require("../../handlers/draftHandlers/teamFormation.js");
const pairings = require("../../handlers/draftHandlers/pairings.js");
const guildEnv = require("../../guildEnv.js");
const log = require("../../utils/log.js");
const Draft = require("../../models/draftClass.js");


module.exports = {
  /**
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {Map} ongoingDrafts
   */
  callback: async (client, interaction, ongoingDrafts) => {
    log("draft.js",`Draft command called by ${interaction.member.displayName} in ${interaction.channel.name}`);
    if(guildEnv(interaction.guildId).DRAFT_CHANNELS.findIndex((c) => c == interaction.channelId) === -1) {
      interaction.reply({
        content: "You can't use this command in this channel.",
        ephemeral: true,
      });
      return;
    }
    try {
      if(ongoingDrafts.get(interaction.channelId)) {
        interaction.reply({
          content: "There is already an ongoing draft in this channel. Complete or cancel this draft before starting a new one.",
        });
        return;
      }
      let draft = new Draft();
      ongoingDrafts.set(interaction.channelId, draft);
      draft.leader = interaction.member;
      draft.status = "queue";
      if(interaction.options.get("team-formation")) {
        draft.teamFormation = interaction.options.get("team-formation").value;
      }
      while (true) {
        switch (draft.status) {
          case "cancelled":
            log("draft.js", "Draft cancelled");
            ongoingDrafts.delete(interaction.channelId);
            return;
          case "queue":
            await queue(interaction, draft);
            break;
          case "teamFormation":
            await teamFormation(interaction.channel, draft);
            break;
          case "pairings":
            await pairings(client, interaction.channel, draft);
            break;
          case "finished":
            await interaction.channel.send({
              content: "You completed the draft!",
            });
            ongoingDrafts.delete(interaction.channelId);
            return;
          default:
            log("draft.js", `draft.status switch case error: ${draft.status}`);
        }
      }
    } catch (error) {
      log("draft.js", "Error with draft command");
      console.error(error);
    }
  },
  name: "draft",
  description: "Start a draft!",
  options: [
    {
      name: "team-formation",
      description: "Choose how the teams are formed.",
      type: ApplicationCommandOptionType.String,
      choices : [
        {
          name: "random",
          value: "random"
        },
        {
          name: "captains",
          value: "captains"
        },
        {
          name: "setTeams",
          value: "setTeams"
        }
      ]
    }
  ]
};
