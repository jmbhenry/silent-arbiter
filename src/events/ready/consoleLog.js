const log = require("../../utils/log.js");

module.exports = (client) => {
    log("consoleLog.js", `${client.user.tag} is online`);
};