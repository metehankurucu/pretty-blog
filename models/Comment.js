module.exports = (sequelize, Sequelize) => {
	return sequelize.define('comments', {
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		post_id: {
			type: Sequelize.INTEGER,
			allowNull: false
		},
		username: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		comment: {
			type: Sequelize.TEXT,
			allowNull: false,
		},
		reply: {
			type: Sequelize.TEXT,
			allowNull: false,
		},
		replied_id: {
			type: Sequelize.TEXT,
			allowNull: false,
		},
	})
};
