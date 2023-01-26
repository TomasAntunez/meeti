const Users = require('../../models/Users');
const Groups = require('../../models/Groups');


exports.showUser = async (req, res, next) => {

    const queries = [];

    // Queries at the same time
    queries.push( Users.findOne({ where: {id: req.params.id} }) );
    queries.push( Groups.findAll({ where: {userId: req.params.id} }) );

    const [ user, groups ] = await Promise.all(queries);

    if(!user) {
        req.redirect('/');
        return next();
    }

    // Show view
    res.render('show-profile', {
        pageName: `User Profile: ${user.name}`,
        user,
        groups
    });
};