module.exports = (sequelize, Sequelize) => {
	return sequelize.define('admins', {
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		email: {
			type: Sequelize.STRING,
			allowNull: false
		},
		password: {
			type: Sequelize.TEXT,
			allowNull: false,
		},
		status: {
			type: Sequelize.INTEGER,
			allowNull: false,
			defaultValue:1
		}
	})
};
