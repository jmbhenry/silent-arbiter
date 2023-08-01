const {Client, ButtonBuilder, ButtonStyle, ActionRowBuilder, ChatInputCommandInteraction, ComponentType, EmbedBuilder} = require('discord.js');
const queue = require('../../handlers/draftHandlers/queue.js');
const teamFormation = require('../../handlers/draftHandlers/teamFormation.js');
const CUBE_CHANNEL = "1133249799186030673";
const CURRENT_SET_CHANNEL = "1133249838469873714";

const DRAFT_CHANNELS = [CUBE_CHANNEL, CURRENT_SET_CHANNEL];

const queueButtons = [
    { name:"Join queue", style: ButtonStyle.Primary, disabled : false},
    { name:"Leave queue", style: ButtonStyle.Secondary, disabled : false,},
    { name:"Start draft", style: ButtonStyle.Success, disabled : false, },
    { name:"Cancel draft", style: ButtonStyle.Danger, disabled : false, },
];

module.exports = {  

    /**
     * @param {Client} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    callback: async (client, interaction) => {
        
        const buttons = queueButtons.map((defaultButton) => {
            return new ButtonBuilder()
                .setCustomId(defaultButton.name)
                .setLabel(defaultButton.name)
                .setStyle(defaultButton.style)
                .setDisabled(defaultButton.disabled)
        });
        try {
            const buttonsRow = new ActionRowBuilder().addComponents(buttons);
        
            const queueMessage = await interaction.reply({
                content: "Starting a draft. Click on the button to join the queue",
                components: [buttonsRow],
            });

            const players = await queue(queueMessage);
            if(players.length===0) {
                console.log("0 players in draft -- probably cancelled");
                return;
            }
            console.log(`Starting team formation with ${players.length} players`);
            await teamFormation(interaction.channel, players);
            console.log("Teams formed successfully")
            return;
        }
        catch(error) {
            console.log("Error with draft command");
            console.error(error);
        }
    },
    name: 'draft',
    description: 'Start a draft!',

    // options: Object[],
    // deleted: Boolean,
  };

  