const Sequelize = require('sequelize');
const db = require('../config/db');
const Categories = require('./Categories');
const Users = require('./Users');


const Groups = db.define('groups', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'The group must have a name'
            }
        }
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Put a description'
            }
        }
    },
    url: Sequelize.TEXT,
    image: Sequelize.TEXT
});


Groups.belongsTo(Categories);
Groups.belongsTo(Users);


module.exports = Groups;