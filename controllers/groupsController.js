const Categories = require('../models/Categories');
const Groups = require('../models/Groups');
const { body } = require('express-validator');
const { v4: uuid } = require('uuid');

const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');


const multerConfig = {
    limits: { fileSize: 100000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname+'/../public/uploads/groups');
        },
        filename: (req, file, next) => {
            const extension = file.mimetype.split('/')[1];
            next(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, next) {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            // The format is valid
            next(null, true);

        } else {
            // The format is not valid
            next(new Error('Invalid format'), false);
        }
    }
};

const upload = multer(multerConfig).single('image');

// Upload image to server
exports.uploadImage = (req, res, next) => {

    upload(req, res, function(error) {
        if(error) {
            if(error instanceof multer.MulterError) {
                if(error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'The file is too long');

                } else {
                    req.flash('error', error.message);
                }
            } else if(error.hasOwnProperty('message')) {
                req.flash('error', error. message);
            }
            res.redirect('back');
            return;

        } else {
            next();
        }
    });
};


exports.formNewGroup = async (req, res) => {

    const categories = await Categories.findAll({ order: [['id', 'ASC']] });

    res.render('new-group', {
        pageName: 'Create a new group',
        categories
    })
};


// Store the groups in the database
exports.createGroup = async (req, res) => {
    // Sanitize
    await body('name').escape().run(req);
    await body('url').escape().run(req);

    const group = req.body;

    // Generate unique id
    group.id = uuid();

    // Stores the authenticated user as the creator of the group
    group.userId = req.user.id;

    // Read image
    if(req.file) {
        group.image = req.file.filename;
    }

    try {
        // Store it in the database
        await Groups.create(group);
        req.flash('exito', 'The group has been created successfully');
        res.redirect('/admin');
        
    } catch (error) {
        console.log(error);
        // Extract the error message
        const sequelizeErrors = error.errors?.map(err => err.message) || [];

        req.flash('error', sequelizeErrors);
        res.redirect('/new-group');
    }
};


exports.formEditGroup = async (req, res) => {

    const [ group, categories ] = await Promise.all([
        Groups.findByPk(req.params.groupId),
        Categories.findAll({ order: [['id', 'ASC']] })
    ]);

    res.render('edit-group', {
        pageName: `Edit group: ${group.name}`,
        group,
        categories
    });
}

// Save changes in the db
exports.editGroup = async (req, res, next) => {
    const group = await Groups.findOne({ where: {
        id: req.params.groupId,
        userId: req.user.id
    }});

    // If group does not exist
    if(!group) {
        req.flash('error', 'Invalid operation');
        res.redirect('/admin');
        return next();
    }

    await body('name').escape().run(req);
    await body('url').escape().run(req);

    // All good
    const { name, description, categoryId, url } = req.body;

    // Assing the values
    group.name = name;
    group.description = description;
    group.categoryId = categoryId;
    group.url = url;

    // Save in the db
    await group.save();
    req.flash('exito', 'Changes stored successfully');
    res.redirect('/admin');
};


// Shows the form to edit the group image
exports.formEditImage = async (req, res) => {

    const group = await Groups.findByPk(req.params.groupId);

    res.render('group-image', {
        pageName: `Edit group image: ${group.name}`,
        group
    });
};

// Modify the image in the db and remove the old one
exports.editImage = async (req, res, next) => {

    const group = await Groups.findOne({ where: {
        id: req.params.groupId,
        userId: req.user.id
    }});

    if(!group) {
        req.flash('error', 'Invalid operation');
        res.redirect('/admin');
        return next();
    }

    // // Verify that the file is new
    // if(req.file) {
    //     console.log(req.file);
    // }

    // // Check if a previous image exists
    // if(group.image) {
    //     console.log(group.image);
    // }

    // If there is a previous image and a new one, it means that we are going to delete the previous one
    if(req.file && group.image) {
        const pathPreviousImg = __dirname + `/../public/uploads/groups/${group.image}`;
        // Delete file with fs
        fs.unlink(pathPreviousImg, error => {
            if(error) {
                console.log(error);
            }
            return;
        });
    }

    // If there is a previous image, save it
    if(req.file) {
        group.image = req.file.filename;
    }

    // Save in the db
    await group.save();
    req.flash('exito', 'Changes stored successfully');
    res.redirect('/admin');
};


// Show form to delete group
exports.formDeleteGroup = async (req, res, next) => {

    const group = await Groups.findOne({ where: {
        id: req.params.groupId,
        userId: req.user.id
    }});

    if(!group) {
        req.flash('error', 'Invalid operation');
        res.redirect('/admin');
        return next();
    }

    // All good
    res.render('delete-group', {
        pageName: `Delete group: ${group.name}`
    })
};

// Delete group and image
exports.deleteGroup = async (req, res, next) => {

    const group = await Groups.findOne({ where: {
        id: req.params.groupId,
        userId: req.user.id
    }});

    if(!group) {
        req.flash('error', 'Invalid operation');
        res.redirect('/admin');
        return next();
    }

    // If there is an image, you have to delete it
    if(group.image) {
        const pathPreviousImg = __dirname + `/../public/uploads/groups/${group.image}`;
        // Delete file with fs
        fs.unlink(pathPreviousImg, error => {
            if(error) {
                console.log(error);
            }
            return;
        });
    }

    // Delete group
    await Groups.destroy({
        where: {
            id: req.params.groupId
        }
    });

    req.flash('exito', 'Group deleted successfully');
    res.redirect('/admin');
};