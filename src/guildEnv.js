const { ButtonStyle } = require("discord.js");

const LYSERG_TEST_SERVER = "1133047190214951093";
const MONEY_DRAFT_SERVER = "715228693529886760";

module.exports = (guildId) => {
  if (guildId === LYSERG_TEST_SERVER) {
    return {
      BOT_ADMIN_ROLE: "1137581592647307356",
      DRAFT_CHANNELS: ["1136003907596849173"],
      ROLE_CHANNEL : "1142301296678936659",
      OPT_IN_ROLES : [
        { id: "1133131119630495835", label: "Cube Drafters 🧊", style: ButtonStyle.Secondary, description: "Get notifications for Cube team drafts and 8-person rush when it's available on MTGO." },
        { id: "1133179596116860949", label: "Current Set Drafters 🃏", style: ButtonStyle.Danger, description: "Get notifications for 8-person rush of the current draft set." },
      ]
    };
  } else if (guildId === MONEY_DRAFT_SERVER) {
    return {
      BOT_ADMIN_ROLE: "1138859785954013268",
      DRAFT_CHANNELS: [
        "940832475033243688", //#team-draft-room-1
        "1133907357101994104", //#team-draft-room-2
        "1141412157964161064", //#scheduled-drafts
        "1141401243537903626", //#100-ticket-room
        "1138664902186242218", //#elis-draft-room
        "1141401215549313104", //#team-draft-cube
        "1137525063344726188", //#team-draft-flashback
      ],
      ROLE_CHANNEL: "1142675186190127225",
      OPT_IN_ROLES: [
        { id: "940838664861282395", label: "Cube Drafters 🧊", style: ButtonStyle.Primary, description: "Get notifications for Cube team drafts and 8-person rush when it's available on MTGO." },
        { id: "940838804816789525", label: "Current Set Drafters 🃏", style: ButtonStyle.Secondary, description: "Get notifications for 8-person rush of the current draft set." },
        { id: "1138910426139205693", label: "Turbo Drafters 🚀", style: ButtonStyle.Danger, description: "Get notifications for fast Cube team drafts that only play one round." },
      ],
    };
  }
};
