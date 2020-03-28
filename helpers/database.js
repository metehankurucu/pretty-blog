const Sequelize = require('sequelize');

const sequelize = new Sequelize('pretty-blog', 'root', '123456', {
    host: '192.168.64.3',
    dialect: 'mysql',
    timezone: "+03:00",
});

const db = {};

db.Admin = sequelize.import(__dirname + '/../models/Admin.js');
db.Post = sequelize.import(__dirname + '/../models/Post.js');
db.Photo = sequelize.import(__dirname + '/../models/Photo.js');
db.Comment = sequelize.import(__dirname + '/../models/Comment.js');


db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Admin.create({
    id:1,
    email:"admin@admin.com",
    password:'$2a$08$ZLb1/rYfZr7iC.y301FaPe.NpPLfESagZ97vK1ZdLodOoSK6P7Dji'
});

module.exports = db;
