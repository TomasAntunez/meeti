const Sequelize = require('sequelize');
const db = require('../config/db');
const slug = require('slug');
const shortid = require('shortid');

const Users = require('./Users');
const Groups = require('./Groups');


const Meeti = db.define(
    'meeti', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Add a title'
                }
            }
        },
        slug: {
            type: Sequelize.STRING,
        },
        guest: Sequelize.STRING,
        vacancies: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Add a description'
                }
            }
        },
        date: {
            type: Sequelize.DATEONLY,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Add a date'
                }
            }
        },
        time: {
            type: Sequelize.TIME,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Add a time'
                }
            }
        },
        address: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Add an address'
                }
            }
        },
        city: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Add an city'
                }
            }
        },
        state: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Add an state'
                }
            }
        },
        country: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Add an country'
                }
            }
        },
        location: {
            type: Sequelize.GEOMETRY('POINT')
        },
        interested: {
            type: Sequelize.ARRAY(Sequelize.INTEGER),
            defaultValue: []
        }
    }, {
        hooks: {
            async beforeCreate(meeti) {
                const url = slug(meeti.title).toLowerCase();
                meeti.slug = `${url}-${shortid.generate()}`;
            }
        }
    }
);

Meeti.belongsTo(Users);
Meeti.belongsTo(Groups);


module.exports = Meeti;