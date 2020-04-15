const mongoose = require('mongoose');

const campgroundSchema = new mongoose.Schema({
  name: String,
  image: String,
  location: String,
  latlng: String,
  description: String,
  country: String,
  countryCode: String,
  googlePlacesID: String,
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rating' }],
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: String,
  },
});

module.exports = mongoose.model('Campground', campgroundSchema);
