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
		name: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		email: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		comment: {
			type: Sequelize.TEXT,
			allowNull: false,
		},
		reply:{
			type: Sequelize.TEXT,
			allowNull: true,
		},
		replied_name:{
			type: Sequelize.STRING,
			allowNull: true,
		},
		replied_date:{
			type: Sequelize.DATE,
			allowNull: true,
			defaultValue:Sequelize.NOW
		},
	})
};
