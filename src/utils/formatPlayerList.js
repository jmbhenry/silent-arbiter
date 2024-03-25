module.exports = (players) => {
  let counter = 1;
  let formattedList = "---\n";
  for (const player of players) {
    formattedList += `${counter}. ${player.displayName}\n`;
  }
  return formattedList;
};
