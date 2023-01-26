const Meeti = require('../../models/Meeti');
const Groups = require('../../models/Groups');
const Users = require('../../models/Users');
const Categories = require('../../models/Categories');
const Comments = require('../../models/Comments');
const formatDate = require('../../handlers/formatDate');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


exports.showMeeti = async (req, res) => {

    const meeti = await Meeti.findOne({ where: {slug: req.params.slug},
        include: [
            {
                model: Groups
            },
            {
                model: Users,
                attributes: ['id', 'name', 'image']
            }
        ]
    });

    // If there is not meeti
    if(!meeti) {
        res.redirect('/');
    }

    // Ask for meetis nearby
    const location = Sequelize.literal(`ST_GeomFromText( 'POINT( ${meeti.location.coordinates[0]} ${meeti.location.coordinates[1]} )' )`);

    // ST_DISTANCE_Sphere = return a line in meters
    const distance = Sequelize.fn('ST_DistanceSphere', Sequelize.col('location'), location);

    // Find nearby meetis
    const meetis = await Meeti.findAll({
        order: distance, // Order them from closest to farthest
        where: Sequelize.where(distance, { [Op.lte]: 20000 }), // 20km
        limit: 3, // Max 3
        offset: 1,
        include: [
            {
                model: Groups
            },
            {
                model: Users,
                attributes: ['id', 'name', 'image']
            }
        ]
    });

    const comments = await Comments.findAll({
        where: {meetiId: meeti.id},
        include: [
            {
                model: Users,
                attributes: ['id', 'name', 'image']
            }
        ]
    });

    // Pass the result to the view
    res.render('show-meeti', {
        pageName: meeti.title,
        meeti,
        meetis,
        comments,
        formatDate: formatDate.formatFullDate
    });
};


// Confirm or cancel if the user will attend the meeti
exports.confirmAttendance = (req, res) => {

    const { act } = req.body;

    if(act === 'confirm') {
        // Add the user
        Meeti.update(
            { 'interested': Sequelize.fn('array_append', Sequelize.col('interested'), req.user.id) },
            { 'where': {'slug': req.params.slug} }
        );

        // Message
        res.send('You have confirmed your attendance');

    } else {
        // Cancel the user attendance
        Meeti.update(
            { 'interested': Sequelize.fn('array_remove', Sequelize.col('interested'), req.user.id) },
            { 'where': {'slug': req.params.slug} }
        );

        // Message
        res.send('You have canceled your attendance');
    }
};


// Show meeti attendees
exports.showAttendees = async (req, res) => {

    const meeti = await Meeti.findOne({
        where: {slug: req.params.slug},
        attributes: ['interested']
    });

    // Extract interested
    const { interested } = meeti;

    const attendees = await Users.findAll({
        where: {id: interested},
        attributes: ['name', 'image']
    });

    // Render view and pass data
    res.render('meeti-attendees', {
        pageName: 'Attendees List',
        attendees
    });
};

// Show meetis grouped by category
exports.showCategory = async (req, res, next) => {

    const category = await Categories.findOne({
        where: {slug: req.params.slug},
        attributes: ['id', 'name']
    });

    const meetis = await Meeti.findAll({
        order: [ ['date', 'ASC'] ],
        include: [
            {
                model: Groups,
                where: { categoryId: category.id }
            },
            { model: Users }
        ]
    });

    res.render('category', {
        pageName: `Category: ${category.name}`,
        meetis,
        formatDate: formatDate.formatFullDate
    })
};