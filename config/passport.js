const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

module.exports = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  passport.use(
    'local-signup',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
      },
      (req, email, password, done) => {
        if (email) {
          email = email.toLowerCase();
        }
        process.nextTick(() => {
          if (!req.user) {
            User.findOne({ email: email }, (err, user) => {
              if (err) {
                return done(err);
              }
              if (user) {
                return done(
                  null,
                  false,
                  req.flash('error', 'this email is already taken.')
                );
              } else {
                let newUser = new User();
                newUser.username = req.body.username;
                newUser.email = email;
                newUser.password = newUser.generateHash(password);
                newUser.save((err) => {
                  if (err) {
                    return done(err);
                  }
                  return done(null, newUser);
                });
              }
            });
          } else {
            return done(
              null,
              false,
              req.flash('error', 'You are already logged in')
            );
          }
        });
      }
    )
  );

  passport.use(
    'local-login',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
      },
      (req, email, password, done) => {
        if (email) {
          email = email.toLowerCase();
        }
        User.findOne({ email: email }, (err, user) => {
          if (err) {
            return done(err);
          }
          if (!user) {
            return done(
              null,
              false,
              flash('error', 'no such email is registered')
            );
          }
          if (!user.validPassword(password)) {
            return done(null, false, flash('error', 'password is incorrect'));
          } else {
            return done(null, user);
          }
        });
      }
    )
  );
};
