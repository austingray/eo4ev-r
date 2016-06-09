var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var sanitize = require('sanitize-html');

//db objects
var knex = require('knex');
var Users = require('../db/users.js');
var Players = require('../db/players.js');
var Posts = require('../db/posts.js');

///////////////
// Home page //
///////////////
router.get('/', function(req, res, next) {
  new Posts().fetchAll({withRelated: ['user']}).then(function(posts) {
    console.log(posts.toJSON());
    res.render('home', { title: 'Welcome to the homepage for EO4Ev-r', user: req.user, posts: posts.toJSON() });
  });
});

/////////////////
// Admin panel //
/////////////////
router.get('/datadmindoe', function(req, res, next) {
  if (req.user) {
    new Users({ username: req.user.username }).fetch().then(function(model) {
      if (model === null) res.redirect('/');
      var user = model.toJSON();
      if (user.access === 10) {
        res.render('admin', { title: 'hey there super cool admin guy' });
      } else {
        res.sendStatus(404);
      }
    });
  } else {
    res.sendStatus(404);
  }
});
router.post('/datadmindoe', function(req, res, next) {
  if (req.user) {
    new Users({ username: req.user.username }).fetch().then(function(model) {
      if (model === null) res.redirect('/');
      var user = model.toJSON();
      if (user.access === 10) {
        //passes validation, handle it
        console.log(req.body);
        new Posts({ user_id: req.user.id, post_title: sanitize(req.body.post_title), post_content: sanitize(req.body.post_content) }).save().then(function(model) {
          res.redirect('/');
        });
      } else {
        res.sendStatus(404);
      }
    });
  } else {
    res.sendStatus(404);
  }
});

///////////////////
// Play the game //
///////////////////
router.get('/play', function(req, res, next) {
  if (typeof req.user === 'undefined') {
    res.redirect('/');
  } else {
    res.render('game', { title: 'Dat three.js doe', load_game_scripts: true, user: req.user });
  }
});

/////////////////////////
// Manage your account //
/////////////////////////
router.get('/account', function(req, res, next) {
  if (typeof req.user === 'undefined') {
    res.render('login', { title: 'Dat three.js doe - Login/Register', flash: req.flash('error') });
  } else {
    res.render('account', { title: 'Dat three.js doe - My Account', user: req.user });
  }
});

router.post('/register', function(req, res, next) {

  if (req.body.register === 'on') {

    var _username = req.body.username;
    var allowedRegex = /^[a-zA-Z0-9_]{1,15}$/;
    var validUsername = allowedRegex.test(_username);
    if (!validUsername) {
      req.flash('error', 'Invalid username. Please try a new username.');
      res.redirect('/account');
      return;
    }

    if (req.body.password !== req.body.password_confirm) {
      req.flash('error', 'Password mismatch, please try again.');
      res.redirect('/account');
      return;
    }

    convert_to_lower_then_check(_username, function(taken) {

      if (taken) {
        req.flash('error', 'Requested username is not available. Please try a new username.');
        res.redirect('/account');
        return;
      }

      //let's make a new account...
      new Users({ username: req.body.username })
      .fetch()
      .then( function(model) {
        if (null === model) {
          //create new account!
          bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(req.body.password, salt, function(err, hash) {
              new Users({ username:req.body.username, hash: hash, email:req.body.email })
              .save()
              .then(function(model) {
                passport.authenticate('local')(req, res, function() {
                  res.redirect('/account');
                });
              });
            });
          });
        } else {
          //username is already in use
          req.flash('error', 'Requested username is not available. Please try a new username.');
          res.redirect('/account');
        }
      });
    });
    //end registration
  } else {
    res.send('you caused an error, ya freak.');
  }

});

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/account', // see text
    failureFlash: true // optional, see text as well
  }), function (req, res) {
    res.redirect('/account');
});

//////////////////////////////////////////////////////////////////////////////////////
//helper function to convert username to lowercase and check if it is already taken //
//////////////////////////////////////////////////////////////////////////////////////
function convert_to_lower_then_check(username, callback) {
  var _username = username.toLowerCase();
  new Users().query('whereRaw', 'LOWER(username) = ?', _username).fetch().then(function(model) {
    if (null === model) {
      //name doesn't exist
      callback(false);
    } else {
      //name exists
      callback(true);
    }
  });
}


module.exports = router;
