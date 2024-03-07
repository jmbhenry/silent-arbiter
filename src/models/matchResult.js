module.exports = (sequelize, DataTypes) => {
    return sequelize.define('matchResult', {
        draft_id: {
            type: DataTypes.STRING,
            allowNull:false,
        },
        bluePlayer: {
            type: DataTypes.STRING,
            allowNull:false,
        },
        redPlayer: {
            type: DataTypes.STRING,
            allowNull:false,
        },
        result: {
            type: DataTypes.STRING,
            allowNull:false,
        },
    });
};
