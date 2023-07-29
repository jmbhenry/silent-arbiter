const {Client, ButtonBuilder, ButtonStyle, ActionRowBuilder, ChatInputCommandInteraction, ComponentType, EmbedBuilder} = require('discord.js');

const CUBE_CHANNEL = "1133249799186030673";
const CURRENT_SET_CHANNEL = "1133249838469873714";
const DRAFT_CHANNELS = [CUBE_CHANNEL, CURRENT_SET_CHANNEL];

const DRAFT_QUEUE_MAX_SIZE = 8;

const defaultButtons = [
    { name:"Join queue", style: ButtonStyle.Primary, disabled : false},
    { name:"Leave queue", style: ButtonStyle.Secondary, disabled : false,},
    { name:"Start draft", style: ButtonStyle.Success, disabled : true, },
    { name:"Cancel draft", style: ButtonStyle.Danger, disabled : false, },
];

let draft = {
    players : []
}

module.exports = {  

    /**
     * @param {Client} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    callback: async (client, interaction) => {
        
        const buttons = defaultButtons.map((defaultButton) => {
            return new ButtonBuilder()
                .setCustomId(defaultButton.name)
                .setLabel(defaultButton.name)
                .setStyle(defaultButton.style)
                .setDisabled(defaultButton.disabled)
        });
        try {
            const buttonsRow = new ActionRowBuilder().addComponents(buttons);
        
            const message = await interaction.reply({
                content: "Starting a draft. Click on the button to join the queue",
                components: [buttonsRow],
            });

            let draftCanceled = false;
            let draftStarted = false;

            //Waiting for queue to fill up
            while (!draftCanceled && !draftStarted) {
                console.log("waiting for a button click");
                const buttonClicked = await message.awaitMessageComponent({
                    time: 30000,
                })
                .catch(async (error) => {
                    draft.players = [];
                    await message.edit({content: "Draft timed out without firing.", embeds:[], components: []})
                });
                if (!buttonClicked) return;
                
                //Click on Join button
                if(buttonClicked.customId === 'Join queue') {
                    if (draft.players.length >= DRAFT_QUEUE_MAX_SIZE) {
                        await buttonClicked.reply({
                            content: "The draft is full, sorry",
                            ephemeral: true,
                        });
                    } else if (draft.players.find(player => player.id === buttonClicked.user.id)){
                        await buttonClicked.reply({
                            content: "You are already in this draft!",
                            ephemeral: true,
                        });
                    } else {
                        draft.players.push(buttonClicked.user);
                        console.log(`User ${buttonClicked.user.username} joined the queue`);
                        await message.edit({embeds: [playerListEmbed()]})
                        await buttonClicked.reply({
                            content: "Joined the draft!",
                            ephemeral: true,
                        });
                    }
                } 
                // Click on Leave button
                else if(buttonClicked.customId === 'Leave queue') {
                    const index = draft.players.findIndex(player => player.id === buttonClicked.user.id);
                    if (index>-1){
                        draft.players.splice(index, 1);
                        console.log(`User ${buttonClicked.user.username} left the queue`);
                        await message.edit({embeds: [playerListEmbed()]})
                        await buttonClicked.reply({
                            content: "You left the draft.",
                            ephemeral: true,
                        });
                    }   else {
                            await buttonClicked.reply({
                                content: "You are not in this draft!",
                                ephemeral: true,
                            });
                    }
                }
                else {
                    await buttonClicked.reply({
                        content: "Button not supported for now",
                        ephemeral: true,
                    }); 
                }
            }

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


  function playerListEmbed() {
    let playerList = "--\n";
    counter = 1;
    draft.players.forEach((player) => {
        playerList = playerList.concat(`${counter}. ${player.username}\n`);
        counter++;
    })
    const embed = new EmbedBuilder().setTitle("Players").setDescription(playerList);
    return embed;
  }
  