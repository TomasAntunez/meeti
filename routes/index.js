const express = require('express');
const homeController = require('../controllers/homeController');
const usersController = require('../controllers/usersController');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const groupsController = require('../controllers/groupsController');
const meetiController = require('../controllers/meetiController');

const meetiControllerFE = require('../controllers/frontend/meetiController');
const usersControllerFE = require('../controllers/frontend/usersController');
const groupsControllerFE = require('../controllers/frontend/groupsController');
const commentsControllerFE = require('../controllers/frontend/commentsController');
const searchControllerFE = require('../controllers/frontend/searchController');


const router = express.Router();


module.exports = function() {

    // PUBLIC AREA

    router.get('/', homeController.home);

    // Show a meeti
    router.get('/meeti/:slug', meetiControllerFE.showMeeti);

    // Confirm attendance to the meeti
    router.post('/confirm-attendance/:slug', meetiControllerFE.confirmAttendance);

    // Show meeti attendees
    router.get('/attendees/:slug', meetiControllerFE.showAttendees);

    // Add comments in the meeti
    router.post('/meeti/:id', commentsControllerFE.addComment);

    // Delete comments in the meeti
    router.post('/delete-comment', commentsControllerFE.deleteComment);

    // Show profiles in frontend
    router.get('/users/:id', usersControllerFE.showUser);

    // Show a group
    router.get('/groups/:id', groupsControllerFE.showGroup);

    // Show meetis by category
    router.get('/category/:slug', meetiControllerFE.showCategory);

    // Add the search
    router.get('/search', searchControllerFE.searchResults);

    // Create and confirm accounts
    router.get('/create-account', usersController.formCreateAccount);
    router.post('/create-account', usersController.createAccount);
    router.get('/confirm-account/:email', usersController.confirmAccount);

    // Log in
    router.get('/log-in', usersController.formLogIn);
    router.post('/log-in', authController.authenticateUser);

    // Sign off
    router.get('/sign-off', authController.verifyUser, authController.signOff);


    // PRIVATE AREA

    // Admin panel
    router.get('/admin',authController.verifyUser , adminController.adminPanel);


    // New groups
    router.get('/new-group', authController.verifyUser, groupsController.formNewGroup);
    router.post('/new-group', authController.verifyUser, groupsController.uploadImage, groupsController.createGroup);

    // Edit groups
    router.get('/edit-group/:groupId', authController.verifyUser, groupsController.formEditGroup);
    router.post('/edit-group/:groupId', authController.verifyUser, groupsController.editGroup);

    // Edit image group
    router.get('/group-image/:groupId', authController.verifyUser, groupsController.formEditImage);
    router.post('/group-image/:groupId', authController.verifyUser, groupsController.uploadImage, groupsController.editImage);

    // Delete group
    router.get('/delete-group/:groupId', authController.verifyUser, groupsController.formDeleteGroup);
    router.post('/delete-group/:groupId', authController.verifyUser, groupsController.deleteGroup);


    // New Meeti's
    router.get('/new-meeti', authController.verifyUser, meetiController.formNewMeeti);
    router.post('/new-meeti', authController.verifyUser, meetiController.sanitizeMeeti, meetiController.createMeeti);

    // Edit Meeti's
    router.get('/edit-meeti/:id', authController.verifyUser, meetiController.formEditMeeti);
    router.post('/edit-meeti/:id', authController.verifyUser, meetiController.editMeeti);

    // Delete group
    router.get('/delete-meeti/:id', authController.verifyUser, meetiController.formDeleteMeeti);
    router.post('/delete-meeti/:id', authController.verifyUser, meetiController.deleteMeeti);


    // Edit profile information
    router.get('/edit-profile', authController.verifyUser, usersController.formEditProfile);
    router.post('/edit-profile', authController.verifyUser, usersController.editProfile);

    // Modify the password
    router.get('/change-password', authController.verifyUser, usersController.formChangePassword);
    router.post('/change-password', authController.verifyUser, usersController.changePassword);

    // Profile image
    router.get('/profile-image', authController.verifyUser, usersController.formUploadProfileImage);
    router.post('/profile-image', authController.verifyUser, usersController.uploadImage, usersController.saveProfileImage);


    return router;
};