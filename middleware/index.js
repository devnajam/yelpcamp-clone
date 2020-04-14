const indicative = require('indicative');
const Campground = require('../models/campground');
const Comment = require('../models/comment');
const sanitizeHtml = require('sanitize-html');

const MAX_DESC_LENGTH = 800;
const MIN_DESC_LENGTH = 200;
const MAX_INPUT_LENGTH = 120;

let middlewareObj = {};

middlewareObj.checkCampgroundOwnership = (req, res, next) => {
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, (err, foundGround) => {
      if (err) {
        res.flash('error', 'campground not found');
        res.redirect('back');
      } else {
        if (foundGround.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash('error', 'you dont have the permission to do that');
          res.redirect('back');
        }
      }
    });
  } else {
    req.flash('error', 'You need to be logged in to do that');
    res.redirect('back');
  }
};

middlewareObj.checkCommentOwnership = (req, res, next) => {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, (err, foundComment) => {
      if (err) {
        console.log(err);
      } else {
        if (foundComment.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash('error', 'you dont have permission to do that'),
            res.redirect('back');
        }
      }
    });
  } else {
    req.flash('error', 'You need to be logged in to do that');
    res.redirect('back');
  }
};

middlewareObj.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'you need to be logged in to do that');
  res.redirect('/login');
};

middlewareObj.sanitizeUserInput = (req, res, next) => {
  for (let key in req.body) {
    if (req.body[key]) {
      req.body[key] = sanitizeHtml(req.body[key], {
        allowedTags: [],
        allowedAttributes: [],
      });
    }
  }
  return next();
};

middlewareObj.validateForm = (req, res, next) => {
  trim(req);
  let maxDescLength = MAX_DESC_LENGTH;
  if (req.body.desc) {
    let numberOfLineBreaks = (req.body.desc.match(/\n/g) || []).length;
    maxDescLength = MAX_DESC_LENGTH + numberOfLineBreaks;
  }
  //CONTINUE HERE
};
