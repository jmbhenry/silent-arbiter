require("dotenv").config();
const {
  Client,
  IntentsBitField,
  Events,
} = require("discord.js");
const Sequelize = require('sequelize');
const eventHandler = require("./handlers/eventHandler");
const log = require("./utils/log.js");
const draftResult = require("./models/draftResult.js");


const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMessageReactions,
  ],
});

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

client.once(Events.ClientReady, readyClient => {
	log("index.js",`Ready! Logged in as ${readyClient.user.tag}`);
});

(async () => {
  try {
    eventHandler(client);
    client.login(process.env.TOKEN);
  } catch (error) {
    log("index.js", `Error connecting to the database : ${error}`);
  }
})();

