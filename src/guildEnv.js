const LYSERG_TEST_SERVER = "1133047190214951093";
const MONEY_DRAFT_SERVER = "715228693529886760";

module.exports = (guildId) => {
  if (guildId === LYSERG_TEST_SERVER) {
    return {
      BOT_ADMIN_ROLE: "1137581592647307356",
      DRAFT_CHANNELS: ["1136003907596849173"],
    };
  } else if (guildId === MONEY_DRAFT_SERVER) {
    return {
      BOT_ADMIN_ROLE: "1138859785954013268",
      DRAFT_CHANNELS: [
        "940832475033243688", //#team-draft-room-1
        "1133907357101994104", //#team-draft-room-2
        "1138664902186242218", //#elis-turbo-draft
        "1137525063344726188", //#10-ticket-drafts
      ],
    };
  }
};
