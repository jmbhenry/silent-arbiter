require("dotenv").config();
const {
  Client,
  IntentsBitField,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const mongoose = require("mongoose");
const eventHandler = require("./handlers/eventHandler");
const log = require("./utils/log.js");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMessageReactions,
  ],
});

(async () => {
  try {
    //mongoose.set('strictQuery', false);
    //await mongoose.connect(process.env.MONGODB_URI);
    //log("index.js", "Connected to DB.")
    eventHandler(client);
  } catch (error) {
    log("index.js", `Error connecting to the database : ${error}`);
  }
})();

client.login(process.env.TOKEN);
