module.exports = (sequelize, Sequelize) => {
	return sequelize.define('posts', {
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },
        title: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		content: {
			type: Sequelize.TEXT,
			allowNull: false
        },
        thumbnail: {
			type: Sequelize.STRING,
			allowNull: false
		},
		status: {
			type: Sequelize.INTEGER,
			allowNull: false,
			defaultValue:0
		}
	})
};
