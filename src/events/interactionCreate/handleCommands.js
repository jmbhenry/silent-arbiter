const { devs, testServer } = require ('../../../config.json');
const getLocalCommands = require('../../utils/getLocalCommands');


module.exports = async (client, interaction) => {
    if(!interaction.isChatInputCommand()) return;
    const localCommands = getLocalCommands();
    try {
        //Finding the file corresponding to the command
        const commandObject = localCommands.find(
            (cmd) => cmd.name === interaction.commandName
        );
        if(!commandObject) return;
        //Testing devOnly property
        if(commandObject.devOnly){
            if(!devs.includes(interaction.member.id)){
                interaction.reply({
                    content: 'Only developers are allowed to run this command.',
                    ephemeral: true,
                });
                return;
            }
        }
        //Testing testOnly property
        if(commandObject.testOnly){
            if(!(testServer === interaction.guildId)){
                interaction.reply({
                    content: 'This command cannot be ran here',
                    ephemeral: true,
                });
                return;
            }
        }
        //Testing permissions
        if(commandObject.permissionsRequired?.length){
            for(const permission of commandObject.permissionsRequired) {
                if(!interaction.member.permissions.has(permission)) {
                    interaction.reply({
                        content: 'Not enough permissions.',
                        ephemeral: true,
                    });
                    return;
                }
            }
        }
        //Testing permissions for the bot
        if(commandObject.botPermissions?.length){
            for(const permission of commandObject.botPermissions){
                const bot = interaction.guild.members.me;
                if(!bot.permissions.has(permission)) {
                    interaction.reply({
                        content: "I don't have enough permissions.",
                        ephemeral: true,
                    });
                    return;
                }
            }
        }
        //Running the command once all the checks are done
        await commandObject.callback(client, interaction);
    }
    catch(error){
        log("handleCommand.js",`There was an error running the command ${error}`);
    }
};