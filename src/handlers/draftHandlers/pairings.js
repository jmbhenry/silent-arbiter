const shuffleArray = require("../../utils/shuffleArray.js");
const {
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
} = require("discord.js");
const buttonPermissionCheck = require("../../utils/buttonPermissionCheck.js");
const Draft = require("../../models/draftClass.js");

const NUMBER_OF_ROUNDS = 3;

/**
 * @param {Channel} channel
 * @param {Draft} draft
 */
module.exports = async (channel, draft) => {
  const revealPairingsRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("reveal")
      .setLabel("Reveal pairings")
      .setStyle(ButtonStyle.Primary)
  );

  const message = await channel.send({
    content: "Click on the button once the draft is over",
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

  //Wait for the reveal pairings button to be clicked
  let pairingsHidden = true;
  while(pairingsHidden) {
    const buttonClicked = await message.awaitMessageComponent();
    console.log(`${buttonClicked.user.username} clicked on the reveal button`)
    if (buttonClicked.customId === "reveal") {
        if(buttonPermissionCheck(buttonClicked, draft)) {
        await buttonClicked.update({
          content: `Play your matches! \nPairings were revealed by ${buttonClicked.user.username} at ${new Date()}`,
          embeds: [pairingsEmbed],
          components: [finishDraftRow],
        });
        pairingsHidden = false;
      }
    }
  }

  //Wait for the finish draft button to be clicked
  while(draft.status === "pairings") {
    const buttonClicked2 = await message.awaitMessageComponent();
    if (buttonClicked2.customId === "finish") {
      if(buttonPermissionCheck(buttonClicked2, draft)) {
        await buttonClicked2.update({
          content: "The draft is over",
          components: [],
        });
        draft.status = "finished";
      }
    }
  }
  return;
};
