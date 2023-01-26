const passport = require("passport");


exports.authenticateUser = passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/log-in',
    failureFlash: true,
    badRequestMessage: 'Both fields are required'
});


// Check if user is authenticated
exports.verifyUser = (req, res, next) => {
    // If user is authenticated
    if(req.isAuthenticated()) {
        return next();
    }

    // if user is not authenticated
    return res.redirect('/log-in');
};

// Sign off
exports.signOff = (req, res, next) => {
    req.logout(function(err) {
        if(err) return next();
        req.flash('exito', 'You successfully logged out');
        res.redirect('/log-in');
        next();
    });

};