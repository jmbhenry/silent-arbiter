module.exports = (sequelize, DataTypes) => {
    return sequelize.define('matchResult', {
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
