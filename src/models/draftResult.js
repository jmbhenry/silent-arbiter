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
        }
    });
};
