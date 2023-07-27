const {ButtonBuilder, ButtonStyle, ActionRowBuilder} = require('discord.js');

const CUBE_CHANNEL = "1133249799186030673";
const CURRENT_SET_CHANNEL = "1133249838469873714";
const DRAFT_CHANNELS = [CUBE_CHANNEL, CURRENT_SET_CHANNEL];

const DRAFT_QUEUE_MAX_SIZE = 8;

const JOIN_DRAFT_BUTTON = "join";
const LEAVE_DRAFT_BUTTON = "leave";
const START_DRAFT_BUTTON = "start";
const CANCEL_DRAFT_BUTTON = "cancel";

module.exports = {
    name: 'draft',
    description: 'Start a draft!',
    // devOnly: Boolean,
    // testOnly: true,
    // options: Object[],
    // deleted: Boolean,
  
    callback: (client, interaction) => {
        try {
            const buttons = new ActionRowBuilder();
            buttons.components.push(new ButtonBuilder().setLabel("Join queue").setStyle(ButtonStyle.Primary).setCustomId(JOIN_DRAFT_BUTTON));
            buttons.components.push(new ButtonBuilder().setLabel("Leave queue").setStyle(ButtonStyle.Secondary).setCustomId(LEAVE_DRAFT_BUTTON));
            buttons.components.push(new ButtonBuilder().setLabel("Start draft").setStyle(ButtonStyle.Success).setCustomId(START_DRAFT_BUTTON).setDisabled(true));
            buttons.components.push(new ButtonBuilder().setLabel("Cancel draft").setStyle(ButtonStyle.Danger).setCustomId(CANCEL_DRAFT_BUTTON));
            if(interaction.channelId === CUBE_CHANNEL) {
                interaction.reply({
                    content:"Starting a cube draft. Click on the button to join the queue",
                    components: [buttons],
                });
            }
            else if(interaction.channelId === CURRENT_SET_CHANNEL) {
                interaction.reply({
                    content:"Starting a current draft. Click on the button to join the queue",
                    components: [buttons],
                });
            }
        }
        catch(error) {
            console.log(interaction);
            console.log(error);
        }
    },
  };
  