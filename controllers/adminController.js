const Groups = require('../models/Groups');
const Meeti = require('../models/Meeti');
const formatDate = require('../handlers/formatDate');
const Sequelize = require('sequelize');


const Op = Sequelize.Op;


exports.adminPanel = async (req, res) => {

    const date = new Date;

    const queries = [];
    queries.push(Groups.findAll({ where: {userId: req.user.id} }));

    queries.push(Meeti.findAll({
        where: {
            userId: req.user.id,
            date: { [Op.gte]: date }
        },
        order: [['date', 'ASC']]
    }));

    queries.push(Meeti.findAll({ where: {
        userId: req.user.id,
        date: { [Op.lt]: date }
    }}));

    const [groups, meetis, oldMeetis] = await Promise.all(queries);

    // console.log(meetis);

    res.render('admin', {
        pageName: 'Administration Panel',
        meetis,
        groups,
        oldMeetis,
        formatDate: formatDate.formatFullDate
    })
};