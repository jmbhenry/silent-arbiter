require('dotenv').config();
const {Client, IntentsBitField, ButtonBuilder, ButtonStyle, ActionRowBuilder} = require('discord.js');
const mongoose = require('mongoose');
const eventHandler = require('./handlers/eventHandler');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessageReactions,
    ]
}); 

(async () => {
    try{
        //mongoose.set('strictQuery', false);
        //await mongoose.connect(process.env.MONGODB_URI);
        //console.log("Connected to DB.")
        eventHandler(client);
    }
    catch (error) {
        console.log(`Error connecting to the database : ${error}`);
    }
})();


client.login(process.env.TOKEN);