const Categories = require('../models/Categories');
const Meeti = require('../models/Meeti');
const Groups = require('../models/Groups');
const Users = require('../models/Users');
const Op = require('sequelize').Op;
const formatDate = require('../handlers/formatDate');


exports.home = async (req, res) => {

    // Promise for the consultations in the home
    const queries = [];

    queries.push(Categories.findAll());

    queries.push(Meeti.findAll({
        where: { date: {[Op.gte]: new Date} },
        attributes: ['slug', 'title', 'date', 'time'],
        limit: 3,
        order: [ ['date', 'ASC'] ],
        include: [
            {
                model: Groups,
                attributes: ['image']
            },
            {
                model: Users,
                attributes: ['name', 'image']
            }
        ]
    }));

    // Extract and pass to view
    const [ categories, meetis ] = await Promise.all(queries);

    res.render('home', {
        pageName: 'Beginning',
        categories,
        meetis,
        formatDate: formatDate.formatFullDate
    });
};