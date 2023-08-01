const { ButtonBuilder } = require("@discordjs/builders");
const { ButtonStyle, ActionRowBuilder, EmbedBuilder } = require("discord.js");
const formatPlayerList = require("../../utils/formatPlayerList.js");

const DRAFT_ORDER = [0, 1, 1, 0, 0, 1];

/**
 * @param {ChatInputCommandInteraction} interaction
 */
module.exports = async (channel, playerList) => {
  //Selecting captains
  let redTeam = [];
  let blueTeam = [];
  const redCaptainIndex = Math.floor(Math.random() * playerList.length);
  const redCaptain = playerList.at(redCaptainIndex);
  redTeam.push(redCaptain);
  playerList.splice(redCaptainIndex, 1);
  const blueCaptainIndex = Math.floor(Math.random() * playerList.length);
  const blueCaptain = playerList.at(blueCaptainIndex);
  blueTeam.push(blueCaptain);
  playerList.splice(blueCaptainIndex, 1);

  const message = await channel.send({ content: "Loading..." });
  let pickCounter = 0;
  let picker;

  while (playerList.length > 0) {

    if (DRAFT_ORDER.at(pickCounter) === 0) {
      picker = { captain: redCaptain, team: redTeam };
    } else {
      picker = { captain: blueCaptain, team: blueTeam };
    }

    await message.edit({
      content: `${redCaptain.username} and ${blueCaptain.username} are the team captains.`,
      embeds: [getTeamEmbed(redTeam, blueTeam, picker)],
      components: getPlayerButtonsRows(playerList),
    });
    const buttonClicked = await message
      .awaitMessageComponent({
        time: 300000,
      })
      .catch(async (error) => {
        players = [];
        await message.edit({
          content: "Draft was cancelled after timing out.",
          embeds: [],
          components: [],
        });
      });
    if (!buttonClicked) return;

    if (buttonClicked.member.user != picker.captain) {
      await buttonClicked.reply({
        content: "Don't click that!",
        ephemeral: true,
      });
    } else {
      const pickedPlayer = playerList
        .splice(buttonClicked.customId, 1)
        .at(0);
      picker.team.push(pickedPlayer);
      pickCounter++;
      await buttonClicked.reply({
        content: `You picked ${pickedPlayer.username}`,
        ephemeral: true,
      });
    }
  }

  await message.edit({
    content: `Teams have been picked! Head to draftmancer to draft now.`,
    embeds: [getTeamEmbed(redTeam, blueTeam)],
    components: [],
  });

  return;
};

function getPlayerButtonsRows(players) {
  let playerButtonsRows = [];
  let rowIndex = 0;
  let buttonCounter = 0;
  for (const player of players) {
    //Discord limits to 5 the number of button per row
    if (!playerButtonsRows.at(rowIndex)) {
      playerButtonsRows.push(new ActionRowBuilder());
    }
    if (playerButtonsRows.at(rowIndex).length >= 5) {
      playerButtonsRows.push(new ActionRowBuilder());
      rowIndex++;
    }
    playerButtonsRows
      .at(rowIndex)
      .components
      .push(
        new ButtonBuilder()
          .setCustomId(buttonCounter.toString())
          .setLabel(player.username)
          .setStyle(ButtonStyle.Secondary)
      );
    buttonCounter++;
  }
  console.log(`playerButtonsRows length: ${playerButtonsRows.length}`);
  console.log(`playerButtonsRows: ${playerButtonsRows}`);
  return playerButtonsRows;
}

function getTeamEmbed(redTeam, blueTeam, picker) {
  let embed = new EmbedBuilder().setTitle("Teams").addFields(
    {
      name: "Red Team 🔴",
      value: formatPlayerList(redTeam),
      inline: true,
    },
    {
      name: "Blue Team 🔵",
      value: formatPlayerList(blueTeam),
      inline: true,
    }
  );
  if (picker) {
    embed.setDescription(`It's ${picker.captain.username}'s turn to pick`);
  }
  return embed;
}
