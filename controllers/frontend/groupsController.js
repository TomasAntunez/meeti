const Groups = require('../../models/Groups');
const Meeti = require('../../models/Meeti');
const formatDate = require('../../handlers/formatDate');


exports.showGroup = async (req, res) => {

    const queries = [];

    queries.push( Groups.findOne({ where: {id: req.params.id} }) );
    queries.push( Meeti.findAll({
        where: { groupId: req.params.id },
        order: [
            ['date', 'ASC']
        ]
    }));

    const [group, meetis] = await Promise.all(queries);

    // If there is not a group
    if(!group) {
        res.redirect('/');
        return next();
    }

    // Show view
    res.render('show-group', {
        pageName: `Group Info: ${group.name}`,
        group,
        meetis,
        formatDate: formatDate.formatFullDate
    });
};