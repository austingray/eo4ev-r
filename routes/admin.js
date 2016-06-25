//core
var express = require('express');
var router = express.Router();
//form handling
var sanitize = require('sanitize-html');
var path = require('path');
var fs = require('fs');
var slug = require('slug');
var uuid = require('uuid');
var multer  = require('multer');
var storage = multer.diskStorage({
  destination: 'public/assets',
  filename: function(req, file, cb) {
    var extension = file.originalname.split('.').pop();
    cb(null, uuid.v4() + '.' + extension);
  }
});
var upload = multer({ storage:storage });

//db objects
var knex = require('knex');
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
var makeDirIfDoesNotExist = function(dirname) {
  if ( ! fs.existsSync( dirname ) ) {
    fs.mkdirSync( dirname );
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
    res_object.user = req.user;
    res_object.section = 'main';
    res.render('admin', res_object);
  });
});

///////////
// posts //
///////////
router.get('/post', function(req, res, next) {
  validateAdmin(req, res, function() {
    res_object.user = req.user;
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
        new Assets().fetchAll({ withRelated: ['asset_type', 'asset_category'] }).then(function(model) {
          var assets = model.toJSON();

          //set our res_object
          res_object.user = req.user;
          res_object.section = 'assets';
          res_object.asset_types = asset_types;
          res_object.asset_categories = asset_categories;
          res_object.assets = assets;
          res_object.flash = req.flash('error');

          //render dat page
          res.render('admin', res_object);

        });
      });
    });

  });
});

router.get('/assets/add', function(req, res, next) {
  validateAdmin(req, res, function() {

    //get all assets, asset types, asset categories
    new Asset_Types().fetchAll().then(function(model) {
      var asset_types = model.toJSON();
      new Asset_Categories().fetchAll().then(function(model) {
        var asset_categories = model.toJSON();
        new Assets().fetchAll().then(function(model) {
          var assets = model.toJSON();

          //set our res_object
          res_object.user = req.user;
          res_object.section = 'assets_add';
          res_object.asset_types = asset_types;
          res_object.asset_categories = asset_categories;
          res_object.assets = assets;
          res_object.flash = req.flash('error');

          //render dat page
          res.render('admin', res_object);

        });
      });
    });

  });
});

router.post('/assets/add', upload.single('asset_file'), function(req, res, next) {
  validateAdmin(req, res, function() {

    //setup vars
    var asset_type = {};
    var asset_category = {};
    var uploaded_assets = [];

    new Assets({ name: sanitize( req.body.asset_name ) }).fetch().then(function(exists) {
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
          for (var j = 0; j < asset_categories.length; j++) {
            if (asset_categories[j].id === req.body.asset_category) {
              asset_category = asset_categories[j];
              break;
            }
          }

          var model_object = {
            name: sanitize(req.body.asset_name),
            asset_type: sanitize(req.body.asset_type),
            asset_category: sanitize(req.body.asset_category),
            resource_file_url: req.file.path
          };

          if (typeof uploaded_assets[0] !== 'undefined')
            model_object.resource_file_url = uploaded_assets[0];
          if (typeof uploaded_assets[1] !== 'undefined')
            model_object.resource_skin_url = uploaded_assets[1];
          if (req.body.asset_color)
            model_object.color = req.body.asset_color;

          new Assets( model_object ).save().then(function(model) {
            req.flash('error', 'Asset added successfully.');
            res.redirect('/datadmindoe/assets');
          });

        });
      });

    });

  });
});



module.exports = router;
