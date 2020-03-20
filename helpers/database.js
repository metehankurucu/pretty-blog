const Sequelize = require('sequelize');

const sequelize = new Sequelize('pretty-blog', 'root', '123456', {
    host: '192.168.64.3',
    dialect: 'mysql',
    timezone: "+03:00",
});

const db = {};

db.Admin = sequelize.import(__dirname + '/../models/Admin.js');
db.Post = sequelize.import(__dirname + '/../models/Post.js');

db.Sequelize = Sequelize;
db.sequelize = sequelize;


module.exports = db;
