const shuffleArray = require("../../utils/shuffleArray.js");
const {
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
} = require("discord.js");
const Draft = require("../../models/draftClass.js");

const NUMBER_OF_ROUNDS = 3;

/**
 * @param {Channel} channel
 * @param {Draft} draft
 */
module.exports = async (channel, draft) => {
  draft.status = "pairings";
  const revealPairingsRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("reveal")
      .setLabel("Reveal pairings")
      .setStyle(ButtonStyle.Primary)
  );

  const message = await channel.send({
    content: "Play your matches!",
    components: [revealPairingsRow],
  });

  draft.redTeam = shuffleArray(draft.redTeam);
  draft.blueTeam = shuffleArray(draft.blueTeam);

  const pairingsEmbed = new EmbedBuilder().setTitle("Pairings");

  for (let round = 1; round <= NUMBER_OF_ROUNDS; round++) {
    let pairingsEmbedText = "";
    for (
      let playerIndex = 0;
      playerIndex < draft.redTeam.length;
      playerIndex++
    ) {
      pairingsEmbedText += `${draft.redTeam.at(playerIndex).username} vs ${
        draft.blueTeam.at((playerIndex + round) % draft.blueTeam.length)
          .username
      }\n`;
    }
    pairingsEmbed.addFields({
      name: `Round ${round}`,
      value: pairingsEmbedText,
    });
  }

  const finishDraftRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("finish")
      .setLabel("Finish Draft")
      .setStyle(ButtonStyle.Success)
  );
  console.log("Step 3");

  //Wait for the reveal pairings button to be clicked
  const buttonClicked = await message.awaitMessageComponent();
  if (buttonClicked.customId === "reveal") {
    await buttonClicked.update({
      embeds: [pairingsEmbed],
      components: [finishDraftRow],
    });
  }

  //Wait for the finish draft button to be clicked
  const buttonClicked2 = await message.awaitMessageComponent();
  if (buttonClicked2.customId === "finish") {
    await buttonClicked2.update({
      content: "The draft is over",
      components: [],
    });
  }
  draft.status = "finished";
  console.log(`draft status : ${draft.status}`);
  return;
};
