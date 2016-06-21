//core
var express = require('express');
var router = express.Router();
//form handling
var sanitize = require('sanitize-html');
var path = require('path');
var fs = require('fs');
var slug = require('slug');
var Busboy = require('busboy')

//db objects
var knex = require('knex');
var Users = require('../db/users.js');
var Characters = require('../db/characters.js');
var Sexes = require('../db/sexes.js');
var Races = require('../db/races.js');
var Classes = require('../db/classes.js');
var Posts = require('../db/posts.js');
var Assets = require('../db/assets.js');
var Asset_Types = require('../db/asset_types.js');
var Asset_Categories = require('../db/asset_categories.js');

/////////////
// helpers //
/////////////
var validateAdmin = function(req, res, callback) {
  if (req.user && req.user.access === 10) {
    callback();
  } else {
    res.sendStatus(404);
  }
}

/////////////////////////////
// generic response object //
/////////////////////////////
var res_object = {
  title: 'hey there super cool admin guy',
  admin: true
}

/////////////////
// Admin panel //
/////////////////
router.get('/', function(req, res, next) {
  validateAdmin(req, res, function() {
    res_object.section = 'main';
    res.render('admin', res_object);
  });
});

///////////
// posts //
///////////
router.get('/post', function(req, res, next) {
  validateAdmin(req, res, function() {
    res_object.section = 'post';
    res.render('admin', res_object);
  });
});

router.post('/post', function(req, res, next) {
  validateAdmin(req, res, function() {
    new Posts({ user_id: req.user.id, post_title: sanitize(req.body.post_title), post_content: sanitize(req.body.post_content) }).save().then(function(model) {
      res.redirect('/');
    });
  });
});

///////////////////
// asset manager //
///////////////////
router.get('/assets', function(req, res, next) {
  validateAdmin(req, res, function() {

    //get all assets, asset types, asset categories
    new Asset_Types().fetchAll().then(function(model) {
      var asset_types = model.toJSON();
      new Asset_Categories().fetchAll().then(function(model) {
        var asset_categories = model.toJSON();
        new Assets().fetchAll().then(function(model) {
          var assets = model.toJSON();

          //set our res_object
          res_object.section = 'assets';
          res_object.asset_types = asset_types;
          res_object.asset_categories = asset_categories;
          res_object.assets = assets;

          //render dat page
          res.render('admin', res_object);

        });
      });
    });
    
  });
});

router.post('/assets', function(req, res, next) {
  validateAdmin(req, res, function() {

    //setup vars
    var asset_type = {};
    var asset_category = {};
    var uploaded_assets = [];
    //busboy
    var busboy = new Busboy({ headers: req.headers });

    new Assets({ name: sanitize( req.body.name ) }).fetch().then(function(exists) {
      if (exists !== null) {
        req.flash('error', 'An asset with that name already exists, please provide a unique name');
        res.redirect('/datadmindoe/assets');
        return;
      }

      //fetch all asset types and categories for reference when saving
      new Asset_Types().fetchAll().then(function(model) {
        var asset_types = model.toJSON();
        new Asset_Categories().fetchAll().then(function(model) {
          var asset_categories = model.toJSON();

          //set asset type
          for (var i = 0; i < asset_types.length; i++) {
            if (asset_types[i].id === req.body.asset_type) {
              asset_type = asset_types[i];
              break;
            }
          }

          //set asset category
          for (var j = 0; j < asset_categories.length; i++) {
            if (asset_categories[j].id === req.body.asset_category) {
              asset_category = asset_categories[j];
              break;
            }
          }

          //busboy file handler
          busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {

            if ( ! fs.existsSync( 'public/assets/' + slug( asset_type.name ) ) )
              fs.mkdirSync( 'public/assets/' + slug( asset_type.name ) );
            if ( ! fs.existsSync( 'public/assets/' + slug( asset_type.name ) + '/' + slug( sanitize ( req.body.name ) ) ) )
              fs.mkdirSync( 'public/assets/' + slug( asset_type.name ) + '/' + slug( sanitize ( req.body.name ) ) )

            var save_file_path = 'public/assets/' + slug( asset_type.name ) + '/' + slug( sanitize ( req.body.name ) ) + '/' + slug( sanitize( filename ) );
            file.pipe(fs.createWriteStream(save_file_path));

            uploaded_assets.push(save_file_path);

          });

          busboy.on('finish', function() {
            req.flash('error', 'Asset added successfully.');

            var model_object = {
              name: sanitize(req.body.name),
              asset_type: sanitize(req.body.asset_type),
              asset_category: sanitize(req.body.asset_category)
            };

            if (typeof uploaded_assets[0] !== 'undefined')
              model_object.resource_file_url = uploaded_assets[0];
            if (typeof uploaded_assets[1] !== 'undefined')
              model_object.resource_skin_url = uploaded_assets[1];
            if (req.body.color)
              model_object.color = req.body.color;

            new Assets( model_object ).save().then(function(model) {
              res.redirect('/datadmindoe/assets');
            });

          });

          req.pipe(busboy);

        });
      });

    });

  });
});

module.exports = router;