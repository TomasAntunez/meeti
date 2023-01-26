const Sequelize = require('sequelize');
const db = require('../config/db');
const bcrypt = require('bcrypt');

const Users = db.define('users', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: Sequelize.STRING(60),
    image: Sequelize.STRING(60),
    description: Sequelize.TEXT,
    email: {
        type: Sequelize.STRING(30),
        allowNull: false,
        validate: {
            isEmail: {msg: 'Add a valid email'}
        },
        unique: true
    },
    password: {
        type: Sequelize.STRING(60),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'The password cannot be empty'
            }
        }
    },
    active: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    tokenPassword: Sequelize.STRING,
    expireToken: Sequelize.DATE
}, {
    hooks: {
        beforeCreate(user) {
            user.password = Users.prototype.hashPassword(user.password);
        }
    }
});

// Method to compare passwords
Users.prototype.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

Users.prototype.hashPassword = function(password) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
};

module.exports = Users;