const express = require('express');
const router = express();
const Campground = require('../models/campground');
const Comment = require('../models/comment');
const middleware = require('../middleware');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const ipapi = require('ipapi.co');

const MAX_FILE_SIZE = 1000000;

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: 'ca-central-1',
});

const s3 = new aws.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    key: function (req, file, cb) {
      const fileExtension = file.originalname.split('.')[1];
      const path = 'upload/' + req.user._id + Date.now() + '.' + fileExtension;
      cb(null, path);
    },
  }),
});

router.get('/', (req, res) => {
  if (Object.keys(req.query).length === 0) {
    let ip = getUserIPAdress(req);
    ipapi.location((ipapiRes) => {
      findCampgrounds(ipapiRes.country_name, ipapiRes.country, req, res);
    }, ip);
  } else {
    let country = req.query.country.trim();
    if (country.indexOf('(') !== -1) {
      country = country.substring(0, country.indexOf('(')).trim();
    }
    findCampgrounds(country, req.query.country_code, req, res);
  }
});

function findCampgrounds(countryName, countryCode, req, res) {
  Campground.find({ countryCode: countryCode.toUpperCase() })
    .populate('ratings')
    .exec(function (err, allCampgrounds) {
      if (err) {
        flashUnexpectedError(req, res, err);
      } else {
        res.render('campground/index', {
          campgrounds: allCampgrounds,
          countryCode: countryCode,
          countryName: countryName,
        });
      }
    });
}

router.post(
  '/',
  upload.array('image', 1),
  middleware.isLoggedIn,
  middleware.sanitizeUserInput,
  middleware.validateForm,
  (req, res) => {
    validateFiles(req, res);
    if (!req.files[0]) {
      req.flash('error', 'You must upload a image file');
      return res.redirect('back');
    }
    let filepath = req.files[0].key;
    let author = {
      id: req.user._id,
      username: req.user.local.username,
    };
    let newCampground = {
      name: req.body.campName,
      location: req.body.location,
      latlng: req.body.mapCoord,
      country: req.body.campgroundCountry,
      countryCode: req.body.campgroundCountryCode.toUpperCase(),
      description: req.body.desc,
      image: filepath,
      author: author,
    };
    Campground.create(newCampground, (err, newlyCreated) => {
      if (err) {
        flashUnexpectedError(req, res, err);
      } else {
        req.flash('success', 'Successfully created campground');
        res.redirect('/campgrounds/' + newlyCreated._id);
      }
    });
  }
);
