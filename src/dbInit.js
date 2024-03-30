const Sequelize = require('sequelize');
const log = require("./utils/log.js");

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const DraftResult = require('./models/draftResult.js')(sequelize, Sequelize.DataTypes);
const MatchResult = require('./models/matchResult.js')(sequelize, Sequelize.DataTypes);

MatchResult.belongsTo(DraftResult);
DraftResult.hasMany(MatchResult);

const force = process.argv.includes('--force') || process.argv.includes('-f');
const alter = process.argv.includes('--alter') || process.argv.includes('-a');

sequelize.sync({ force:force, alter: alter }).then(async () => {
	log("dbInit.js",`Database synced with force: ${force} and alter: ${alter}`);
	sequelize.close();
}).catch(console.error);
