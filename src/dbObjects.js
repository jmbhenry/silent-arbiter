const Sequelize = require('sequelize');

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

module.exports = { DraftResult, MatchResult };
