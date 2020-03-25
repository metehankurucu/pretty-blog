module.exports = (sequelize, Sequelize) => {
	return sequelize.define('photos', {
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },
		url: {
			type: Sequelize.TEXT,
			allowNull: false
        }
	})
};
