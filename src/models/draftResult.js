module.exports = (sequelize, DataTypes) => {
    return sequelize.define('draftResult', {
        draft_number: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        guild_id: {
            type:DataTypes.STRING,
            allowNull: false,
        },
        result: {
            type:DataTypes.STRING,
            allowNull: false,
        },
        team_formation: {
            type:DataTypes.STRING,
            allowNull: false,
        },
        red_captain: {
            type:DataTypes.STRING,
        },
        blue_captain: {
            type:DataTypes.STRING,
        },
    });
};
