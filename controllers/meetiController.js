const Groups = require('../models/Groups');
const Meeti = require('../models/Meeti');
const { v4: uuid } = require('uuid');
const { body } = require('express-validator');


// Show the form to new meeti
exports.formNewMeeti = async (req, res) => {

    const groups = await Groups.findAll({ where: {userId: req.user.id} });

    res.render('new-meeti', {
        pageName: 'Create New Meeti',
        groups
    });
};

// Insert new meeti in tha database
exports.createMeeti = async (req, res) => {
    // Get data
    const meeti = req.body;

    meeti.id = uuid();

    // Assing the user
    meeti.userId = req.user.id;

    // Storethe the location with a point
    const point = { type: 'Point', coordinates: [ parseFloat(meeti.lat), parseFloat(meeti.lng) ] };
    meeti.location = point;

    // Optional vacancies
    if( meeti.vacancies === '' ) {
        meeti.vacancies = 0;
    }

    // Store in db
    try {
        await Meeti.create(meeti);
        req.flash('exito', 'The meeti has been created successfully');
        res.redirect('/admin');

    } catch (error) {
        console.log(error);
        // Extract the error message
        const sequelizeErrors = error.errors?.map(err => err.message) || [];

        req.flash('error', sequelizeErrors);
        res.redirect('/new-meeti');
    }
};

// Sanitize meeti
exports.sanitizeMeeti = async (req, res, next) => {

    const rules = [
        body('title').escape(),
        body('guest').escape(),
        body('vacancies').escape(),
        body('date').escape(),
        body('time').escape(),
        body('address').escape(),
        body('city').escape(),
        body('state').escape(),
        body('country').escape(),
        body('lat').escape(),
        body('lng').escape(),
        body('groupId').escape()
    ];

    await Promise.all(rules.map(validation => validation.run(req)));

    next();
};


// Show form to edit meeti
exports.formEditMeeti = async (req, res, next) => {

    const queries = [];
    queries.push( Groups.findAll({ where: {userId: req.user.id} }) );
    queries.push( Meeti.findByPk(req.params.id) );

    // Return promise
    const [ groups, meeti ] = await Promise.all(queries);

    if(!groups || !meeti) {
        req.flash('error', 'Invalid Operation');
        res.redirect('/admin');
        return next();
    }

    // Show view
    res.render('edit-meeti', {
        pageName: `Edit Meeti: ${meeti.title}`,
        groups,
        meeti
    });
};

// Store changes in the meeti
exports.editMeeti = async (req, res, next) => {

    const meeti = await Meeti.findOne({ where: {
        id: req.params.id,
        userId: req.user.id
    }});

    if(!meeti) {
        req.flash('error', 'Invalid Operation');
        res.redirect('/admin');
        return next();
    }

    // Assing values
    const { groupId, title, guest, date, time, vacancies, description, address, city, state, country, lat, lng } = req.body;

    meeti.groupId = groupId;
    meeti.title = title;
    meeti.guest = guest;
    meeti.date = date;
    meeti.time = time;
    meeti.vacancies = vacancies;
    meeti.description = description;
    meeti.address = address;
    meeti.city = city;
    meeti.state = state;
    meeti.country = country;

    // Assing the point
    const point = { type: 'Point', coordinates: [parseFloat(lat), parseFloat(lng)] };
    meeti.location = point;

    // Store in the db
    await meeti.save();
    req.flash('exito', 'Changes saved successfully');
    res.redirect('/admin');
};


// Show form to delete meeti
exports.formDeleteMeeti = async (req, res, next) => {

    const meeti = await Meeti.findOne({ where: {
        id: req.params.id,
        userId: req.user.id
    }});

    if(!meeti) {
        req.flash('error', 'Invalid operation');
        res.redirect('/admin');
        return next();
    }

    // All good
    res.render('delete-meeti', {
        pageName: `Delete meeti: ${meeti.title}`
    });
};

// Delete group and image
exports.deleteMeeti = async (req, res, next) => {

    const meeti = await Meeti.findOne({ where: {
        id: req.params.id,
        userId: req.user.id
    }});

    if(!meeti) {
        req.flash('error', 'Invalid operation');
        res.redirect('/admin');
        return next();
    }

    // Delete meeti
    await Meeti.destroy({
        where: {
            id: req.params.id
        }
    });

    req.flash('exito', 'Meeti deleted successfully');
    res.redirect('/admin');
};