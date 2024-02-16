require("dotenv").config();
const {
  Client,
  IntentsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMessageReactions,
  ],
});

const roles = [
  {
    id: "1133179596116860949",
    label: "Current Set Drafters",
  },
  {
    id: "1133131119630495835",
    label: "Cube Drafters",
  },
  {
    id: "1133232912586776587",
    label: "Degenerates",
  },
];

client.on("ready", async (c) => {
  try {
    const channel = await client.channels.cache.get("1133047190810534011");
    if (!channel) return;
    const row = new ActionRowBuilder();
    roles.forEach((role) => {
      row.components.push(
        new ButtonBuilder()
          .setCustomId(role.id)
          .setLabel(role.label)
          .setStyle(ButtonStyle.Primary)
      );
    });
    await channel.send({
      content: "Claim or remove a role below",
    });
  } catch (error) {
    log("sendRoleMessage.js", error);
  }
  process.exit();
});

client.login(process.env.TOKEN);
