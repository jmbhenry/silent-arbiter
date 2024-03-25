require("dotenv").config();
const areCommandsDifferent = require("../../utils/areCommandsDifferent");
const getApplicationCommands = require("../../utils/getApplicationCommands");
const getLocalCommands = require("../../utils/getLocalCommands");
const log = require("../../utils/log")

module.exports = async (client) => {
  try {
    const localCommands = getLocalCommands();
    const applicationCommands = await getApplicationCommands(
      client,
      process.env.GUILD_ID
    );
    for (const localCommand of localCommands) {
      const { name, description, options } = localCommand;

      const existingCommand = await applicationCommands.cache.find(
        (cmd) => cmd.name === name
      );

      if (existingCommand) {
        if (localCommand.deleted) {
          await applicationCommands.delete(existingCommand.id);
          log("01registerCommands.js",`🗑 Deleted command "${name}".`);

          continue;
        }

        if (areCommandsDifferent(existingCommand, localCommand)) {
          await applicationCommands.edit(existingCommand.id, {
            description,
            options,
          });

          log( "01registerCommands.js", `🔁 Edited command "${name}".`);
        }
      } else {
        if (localCommand.deleted) {
          log(
            "01registerCommands.js",
            `⏩ Skipping registering command "${name}" as it's set to delete.`
          );
          continue;
        }

        await applicationCommands.create({
          name,
          description,
          options,
        });
        log("01registerCommands.js", `👍 Registered command "${name}."`);
      }
    }
  } catch (error) {
    log("01registerCommands.js", `There was an error 01registerCommands.js: ${error}`);
  }
};
