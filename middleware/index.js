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
  let descriptionRule =
    'required|min:' + MIN_DESC_LENGTH + '|max:' + maxDescLength;
  let basicRule = 'required|max:' + MAX_INPUT_LENGTH;
  const messages = {
    'campName.required': 'Campground Name: required.',
    'location.required': 'Location: required',
    'desc.required': 'Description: required',
    'campName.max': 'Campground Name: Maximum number of characters exceeded',
    'location.max': 'Location: Maximum number of characters exceeded.',
    'desc.max': 'Description: Maximum number of characters exceeded',
    'desc.min': 'Description: Minimum number of characters not met',
  };
  const rules = {
    campName: basicRule,
    location: basicRule,
    desc: descriptionRule,
  };
  const data = {
    campName: req.body.campName,
    location: req.body.location,
    desc: req.body.desc,
  };
  validate(data, rules, messages, req, res, next);
};

middlewareObj.validateRegistrationForm = (req, res, next) => {
  trim(req);
  const rules = {
    username: 'required',
    email: 'required|email',
    password: 'required|min:8',
  };
  const messages = {
    'username.required': 'You must enter a username',
    'email.required': 'you must enter an email address',
    'email.email': 'The email you entered in invalid',
    'password.required': 'you must enter a password',
    'password.min': 'choose a password that is atleast 8 characters long',
  };
  const data = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  };
  validate(data, rules, messages, req, res, next);
};

middlewareObj.validateLoginForm = (req, res, next) => {
  trim(req);
  const rules = {
    email: 'required|email',
    password: 'required'
  }
  const messages = {
    'email.required': 'You must enter an email address',
    'email.email': 'The email address you entered in invalid',
    'password.required': 'You must enter a password'
  }
  const data = {
    email = req.body.email,
    password = req.body.password
  }
  validate(data, rules, messages, req, res, next)
};

function validate(data, rules, messages, req, res, next){
  indicative.validateAll(data, rules, messages).then(function(){return next()}).catch(function(errors){
    var validationErrors = getValidationErrors(errors)
    req.flash('errors', validationErrors)
    res.redirect('back')
  })
}

function trim(req){
  for(let key in req.body){
    req.body[key] = req.body[key].trim()
    if(req.body[key] == ''){
      req.body[key] = null
    }
  }
}

function getValidationErrors(errors){
  let messages = []
  errors.forEach((msgObject)=>{
    messages.push(msgObject.message)
  })
  return messages;
}

module.exports = middlewareObj