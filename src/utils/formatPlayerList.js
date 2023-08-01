module.exports = (players) => {
  let counter = 1;
  let formattedList = "---\n";
  for (const player of players) {
    formattedList += `${counter}. ${player.username}\n`;
  }
  return formattedList;
};
