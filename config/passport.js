const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Users = require('../models/Users');


passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    async (email, password, next) => {
        // This code is executed when filling the form
        const user = await Users.findOne({
            where: {
                email,
                active: 1
            }
        });

        // Check if user exists
        if(!user) return next(null, false, {
            message: 'That user does not exist or it is not confirmed'
        });

        // The user exists , compare password
        const verifyPass = user.validatePassword(password);

        // If password is incorrect
        if(!verifyPass) return next(null, false, {
            message: 'Incorrect Password'
        });

        // All good
        return next(null, user);
    }
));

passport.serializeUser(function(user, cb) {
    cb(null, user);
});

passport.deserializeUser(function(user, cb) {
    cb(null, user);
});

module.exports = passport;