const Sequelize = require('sequelize');
const db = require('../config/db');
const Users = require('./Users');
const Meeti = require('./Meeti');

const Comments = db.define('comments', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    message: Sequelize.TEXT
}, {
    timestamps: false
});

Comments.belongsTo(Users);
Comments.belongsTo(Meeti);

module.exports = Comments;