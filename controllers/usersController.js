const Users = require('../models/Users');
const { body, validationResult } = require('express-validator');
const email = require('../handlers/emails');

const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');


const multerConfig = {
    limits: { fileSize: 1000000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname+'/../public/uploads/profiles');
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


exports.formCreateAccount = (req, res) => {
    res.render('create-account', {
        pageName: 'Create your Account'
    });
};


exports.createAccount = async (req, res) => {

    await body('repeatPassword').notEmpty().withMessage('You must repeat the password').run(req);
    await body('repeatPassword').equals(req.body.password).withMessage('Passwords must be the same').run(req);

    // Read errors
    const expressErrors = validationResult(req);

    const user = req.body;

    try {
        await Users.create(user);

        // Confirmation url
        const url = `http://${req.headers.host}/confirm-account/${user.email}`;

        // Send confirmation email
        await email.sendEmail({
            user,
            url,
            subject: 'Confirm your Meeti account',
            file: 'confirm-account'
        });

        // Flash message and redirect
        req.flash('exito', 'We have sent an email, confirm your account');
        res.redirect('/log-in')

    } catch (error) {
        // Extract the error message
        const sequelizeErrors = error.errors?.map(err => err.message) || [];
        // Extract the error msg
        const expErros = expressErrors.array()?.map(err => err.msg) || [];

        // Unite them
        const errorsList = [...sequelizeErrors, ...expErros];

        if(errorsList.length) {
            req.flash('error', errorsList);
        } else {
            req.flash('error', 'Already registered user');
        }

        res.redirect('/create-account');
    }
};

// Confirm user registration
exports.confirmAccount = async (req, res, next) => {
    // Verify if user exists
    const user = await Users.findOne({ where: {email: req.params.email} });

    // If not exists
    if(!user) {
        req.flash('error', 'That account does not exist')
        res.redirect('/create-account');
        return next();
    }

    // If exists, confirm registration and redirect
    user.active = 1;
    await user.save();

    req.flash('exito', 'The account has been confirmed, you can now log in');
    res.redirect('/log-in');
};

// Login form
exports.formLogIn = (req, res) => {
    res.render('log-in', {
        pageName: 'Log In'
    });
};


// Show form to edit profile
exports.formEditProfile = async (req, res) => {

    const user = await Users.findByPk(req.user.id);

    res.render('edit-profile', {
        pageName: 'Edit profile',
        user
    });
};

// Store in the db
exports.editProfile = async (req, res) => {

    const user = await Users.findByPk(req.user.id);

    await body('name').escape().run(req);
    await body('email').escape().run(req);

    // Read form data
    const { name, description, email } = req.body;

    // Assing values
    user.name = name;
    user.description = description;
    user.email = email;

    // Save in db
    await user.save();
    req.flash('exito', 'Changes saved successfully');
    res.redirect('/admin');
};


// Show form to modify password
exports.formChangePassword = (req, res) => {
    res.render('change-password', {
        pageName: 'Change Password'
    });
};

// Check if the previous password is correct and changes it to a new one
exports.changePassword = async (req, res, next) => {

    const user = await Users.findByPk(req.user.id);

    // Verify current password
    if(!user.validatePassword(req.body.password, user.password)) {
        req.flash('error', 'The current password is incorrect');
        res.redirect('back');
        return next();
    }

    // If the password is correct, hash the new one
    const hashedPassword = user.hashPassword(req.body.newPassword);

    // Assing new password
    user.password = hashedPassword;

    // Store in the database
    await user.save();

    // Redirect
    req.logout(function(err) {
        if(err) return next();
        req.flash('exito', 'Password changed successfully, Log In again');
        res.redirect('/log-in');
    });
};


// Profile image

exports.formUploadProfileImage = async (req, res) => {

    const user = await Users.findByPk(req.user.id);

    // Show view
    res.render('profile-image', {
        pageName: 'Upload profile image',
        user
    });
};

// Save the new image, delete previous one (if there is one)
exports.saveProfileImage = async (req, res) => {

    const user = await Users.findByPk(req.user.id);

    // If there is previous image, delete it
    if(req.file && user.image) {
        const pathPreviousImg = __dirname + `/../public/uploads/profiles/${user.image}`;
        // Delete file with fs
        fs.unlink(pathPreviousImg, error => {
            if(error) {
                console.log(error);
            }
            return;
        });
    }

    // Save the new image
    if(req.file) {
        user.image = req.file.filename;
    }

    // Store in the db and redirect
    await user.save();
    req.flash('exito', 'Changes stored successfully');
    res.redirect('/admin');
};