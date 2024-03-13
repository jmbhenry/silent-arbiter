const Sequelize = require('sequelize');
const log = require("./utils/log.js");

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

require('./models/draftResult.js')(sequelize, Sequelize.DataTypes);
require('./models/matchResult.js')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {
	log("dbInit.js",'Database synced');
	sequelize.close();
}).catch(console.error);
