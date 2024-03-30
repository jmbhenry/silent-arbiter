const shuffleArray = require("../../utils/shuffleArray.js");
const {
  ButtonStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ComponentType,
} = require("discord.js");
const { Op } = require('sequelize');
const { DraftResult, MatchResult} = require("../../dbObjects.js");
const log = require("../../utils/log.js");
const Draft = require("../../models/draftClass.js");
const ResultSlip = require("../../models/resultSlipClass.js");
const draftResult = require("../../models/draftResult.js");
const updateLeaderboard = require("../../handlers/leaderboardHandlers/updateLeaderboard.js");

const NUMBER_OF_ROUNDS = 3;

/**
 * @param {Channel} channel
 * @param {Draft} draft
 */
module.exports = async (client, channel, draft) => {

  let completedMatches = [];
  let matchesLeft = draft.redTeam.length * NUMBER_OF_ROUNDS;
  let matchResultCollectors = [];
  let endMessage;
  const defaultEndMessage = {content: "Click on the buttons to input the match results", components:[]};

  draft.redTeam = shuffleArray(draft.redTeam);
  draft.blueTeam = shuffleArray(draft.blueTeam);

  draft.link = await channel.send({content: ` # Pairings`});

  for (let round = 1; round <= NUMBER_OF_ROUNDS; round++) {
    await channel.send({
      content: `**Round ${round}**`,
    });
    completedMatches[round] = [];
    for (let playerIndex = 0; playerIndex < draft.redTeam.length; playerIndex++) {
      const redPlayer = draft.redTeam.at(playerIndex);
      const bluePlayer = draft.blueTeam.at((playerIndex + round) % draft.blueTeam.length);
      completedMatches[round][playerIndex] = new ResultSlip(redPlayer, bluePlayer);
      let buttons = [];
      buttons[0] = new ButtonBuilder()
        .setCustomId(`${redPlayer.id}`)
        .setLabel(`${draft.redTeam.at(playerIndex).displayName}`)
        .setStyle(ButtonStyle.Danger);

      buttons[1] = new ButtonBuilder()
        .setCustomId(`${bluePlayer.id}`)
        .setLabel(`${draft.blueTeam.at((playerIndex + round) % draft.blueTeam.length).displayName}`)
        .setStyle(ButtonStyle.Primary);

      buttons[2] = new ButtonBuilder()
        .setCustomId("unplayed")
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
        if(interaction.customId == completedMatches[round][playerIndex].getWinner()){
            buttons[0].setLabel(`${redPlayer.displayName}`).setStyle(ButtonStyle.Danger);
            buttons[1].setLabel(`${bluePlayer.displayName}`).setStyle(ButtonStyle.Primary);
            buttons[2].setLabel(`Unplayed Match`).setStyle(ButtonStyle.Secondary);
            completedMatches[round][playerIndex].result = null;
            matchesLeft++;
        }
        /*New or modified match result*/
        else {
          if (!completedMatches[round][playerIndex].result) {
            matchesLeft--;
          }
          switch(interaction.customId) {
            case redPlayer.id:
              buttons[0].setLabel(`${redPlayer.displayName} 🏆`).setStyle(ButtonStyle.Success);
              buttons[1].setLabel(`${bluePlayer.displayName}`).setStyle(ButtonStyle.Secondary);
              buttons[2].setLabel(`Unplayed Match`).setStyle(ButtonStyle.Secondary);
              completedMatches[round][playerIndex].result = "red";
              break;
            case bluePlayer.id:
              buttons[0].setLabel(`${redPlayer.displayName}`).setStyle(ButtonStyle.Secondary);
              buttons[1].setLabel(`${bluePlayer.displayName} 🏆`).setStyle(ButtonStyle.Success);
              buttons[2].setLabel(`Unplayed Match`).setStyle(ButtonStyle.Secondary);
              completedMatches[round][playerIndex].result = "blue";
              break;
            case "unplayed":
              buttons[0].setLabel(`${redPlayer.displayName}`).setStyle(ButtonStyle.Secondary);
              buttons[1].setLabel(`${bluePlayer.displayName}`).setStyle(ButtonStyle.Secondary);
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
  let redScore = 0;
  let blueScore = 0;
  completedMatches.flat().forEach( (match) => {
    if(match.result == "red")
      redScore++;
    else if(match.result == "blue")
      blueScore++;
  });
  draft.result = "draw";
  if(redScore>blueScore)
    draft.result = "red";
  else if(redScore<blueScore)
    draft.result = "blue";
  switch(draft.result) {
    case "red":
      draftResultMessage = `🔴 Red team 🔴 wins the draft ${redScore} - ${blueScore} 🏆`;
      break;
    case "blue" :
      draftResultMessage = `🔵 Blue team 🔵 wins the draft ${blueScore} - ${redScore} 🏆`;
      break;
    case "draw" :
      draftResultMessage = `🤝 Good Game! It's a draw! ${redScore} - ${blueScore} 🤝`;
      break;
  }
  await reply.update({content: draftResultMessage, components: []});
  matchResultCollectors.forEach( (c) => {
    c.stop();
  });

  /*Insert result in database */
  try {
    const draftResult = await DraftResult.create({
      guild_id: channel.guildId,
      team_formation: draft.teamFormation,
      result: draft.result,
      red_captain: draft.redCaptain ? draft.redCaptain.id : null,
      blue_captain: draft.blueCaptain ? draft.blueCaptain.id : null,
    });
    completedMatches.flat().forEach( (match) => {
      MatchResult.create({
        bluePlayer: match.bluePlayer.id,
        redPlayer: match.redPlayer.id,
        result: match.result,
      }).then((mr) => {
        return mr.setDraftResult(draftResult);
      }).then( data => {
        log("pairings.js", `Draft data successfully saved in database.`);
        updateLeaderboard(client, channel.guild);
      });
    });
  }
  catch(error){
    log("pairings.js", error);
  }
  draft.status = "finished";
  return;
};
