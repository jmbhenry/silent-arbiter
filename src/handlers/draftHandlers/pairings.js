const shuffleArray = require("../../utils/shuffleArray.js");
const {
  ButtonStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ComponentType,
} = require("discord.js");
const { Op } = require('sequelize');
const { DraftResult, MatchResult} = require("../../dbObjects.js")
const log = require("../../utils/log.js");
const Draft = require("../../models/draftClass.js");
const ResultSlip = require("../../models/resultSlipClass.js");

const NUMBER_OF_ROUNDS = 3;

/**
 * @param {Channel} channel
 * @param {Draft} draft
 */
module.exports = async (channel, draft) => {

  let completedMatches = [];
  let blueScore=0;
  let redScore=0;
  let matchesLeft = draft.redTeam.length * NUMBER_OF_ROUNDS;
  let matchResultCollectors = [];
  let endMessage;
  const defaultEndMessage = {content: "Click on the buttons to input the match results", components:[]};

  draft.redTeam = shuffleArray(draft.redTeam);
  draft.blueTeam = shuffleArray(draft.blueTeam);

  for (let round = 1; round <= NUMBER_OF_ROUNDS; round++) {
    channel.send({
      content: `Round ${round}`,
    });
    completedMatches[round] = [];
    for (let playerIndex = 0; playerIndex < draft.redTeam.length; playerIndex++) {
      console.log(`Round ${round} pairing initial sent`);
      const redPlayer = draft.redTeam.at(playerIndex).username;
      const bluePlayer = draft.blueTeam.at((playerIndex + round) % draft.blueTeam.length).username;
      completedMatches[round][playerIndex] = new ResultSlip(redPlayer, bluePlayer);
      let buttons = [];
      buttons[0] = new ButtonBuilder()
        .setCustomId(`${redPlayer}`)
        .setLabel(`${draft.redTeam.at(playerIndex).username}`)
        .setStyle(ButtonStyle.Danger);

      buttons[1] = new ButtonBuilder()
        .setCustomId(`${bluePlayer}`)
        .setLabel(`${draft.blueTeam.at((playerIndex + round) % draft.blueTeam.length).username}`)
        .setStyle(ButtonStyle.Primary);

      buttons[2] = new ButtonBuilder()
        .setCustomId(`unplayed`)
        .setLabel("Unplayed Match")
        .setStyle(ButtonStyle.Secondary);
      
      const row = new ActionRowBuilder().addComponents(buttons);

      const pairingMessage = await channel.send({
        components: [row]
      });
      const collector = pairingMessage.createMessageComponentCollector({
        componentType: ComponentType.Button,
      })
      matchResultCollectors.push(collector);
      collector.on('collect', async (interaction) => {
        interaction.deferUpdate();

        /*Undoing a previously inputted result*/
        if(interaction.customId == completedMatches[round][playerIndex].getNameWinner()){
            buttons[0].setLabel(`${redPlayer}`).setStyle(ButtonStyle.Danger);
            buttons[1].setLabel(`${bluePlayer}`).setStyle(ButtonStyle.Primary);
            buttons[2].setLabel(`Unplayed Match`).setStyle(ButtonStyle.Secondary);
            completedMatches[round][playerIndex].result = null;
            matchesLeft++;
            if(interaction.customId === redPlayer)
              redScore--;
            else if(interaction.customId === bluePlayer)
              blueScore--;
        }
        /*New or modified match result*/
        else {
          if (!completedMatches[round][playerIndex].result) {
            matchesLeft--;
          }
          switch(interaction.customId) {
            case redPlayer:
              buttons[0].setLabel(`${redPlayer} 🏆`).setStyle(ButtonStyle.Success);
              buttons[1].setLabel(`${bluePlayer}`).setStyle(ButtonStyle.Secondary);
              buttons[2].setLabel(`Unplayed Match`).setStyle(ButtonStyle.Secondary);
              completedMatches[round][playerIndex].result = redPlayer;
              redScore++;
              break;
            case bluePlayer:
              buttons[0].setLabel(`${redPlayer}`).setStyle(ButtonStyle.Secondary);
              buttons[1].setLabel(`${bluePlayer} 🏆`).setStyle(ButtonStyle.Success);
              buttons[2].setLabel(`Unplayed Match`).setStyle(ButtonStyle.Secondary);
              completedMatches[round][playerIndex].result = bluePlayer;
              blueScore++;
              break;
            case "unplayed":
              buttons[0].setLabel(`${redPlayer}`).setStyle(ButtonStyle.Secondary);
              buttons[1].setLabel(`${bluePlayer}`).setStyle(ButtonStyle.Secondary);
              buttons[2].setLabel(`Unplayed 🤝`).setStyle(ButtonStyle.Success);
              completedMatches[round][playerIndex].result = "unplayed";
              break;
          }
        }
        const row = new ActionRowBuilder().addComponents(buttons);
        await pairingMessage.edit({
          components: [row]
        });
        if(matchesLeft == 0){
          const finishButton = new ButtonBuilder().setLabel("Finish draft").setCustomId("finish").setStyle(ButtonStyle.Primary);
          await endMessage.edit({
            content: `All matches have been completed. Press the button to end the draft and save the results in the database.`,
            components: [new ActionRowBuilder().addComponents(finishButton)],
          });
        } else {
          await endMessage.edit(defaultEndMessage);
        }
      });
      collector.on('end', async () => {
        buttons[0].setDisabled();
        buttons[1].setDisabled();
        buttons[2].setDisabled();
        const row = new ActionRowBuilder().addComponents(buttons);
        await pairingMessage.edit({
          components: [row]
        });
      });
    }
  }
  endMessage = await channel.send(defaultEndMessage);
  const reply = await endMessage.awaitMessageComponent();
  let draftResultMessage;
  if(redScore>blueScore) 
    draftResultMessage = `🔴 Red team 🔴 wins the draft ${redScore} - ${blueScore} 🏆`;
  else if(redScore<blueScore)
   draftResultMessage = `🔵 Blue team 🔵 wins the draft ${blueScore} - ${redScore} 🏆`;
  else
    draftResultMessage = `🤝 Good Game! It's a draw! ${redScore} - ${blueScore} 🤝`

  await reply.update({content: draftResultMessage, components: []});
  matchResultCollectors.forEach( (c) => {
    c.stop();
  });

  /*Insert result in database */
  try {
    const draftResult = await DraftResult.create({guild_id: channel.guildId});
    completedMatches.flat().forEach( (match) => {
      MatchResult.create({
        draft_id: draftResult.draft_number,
        bluePlayer: match.bluePlayer,
        redPlayer: match.redPlayer,
        result: match.result,
      })
    });
  }
  catch(error){
    log("pairings.js", error);
  }

  draft.status = "finished";
  return;
};
