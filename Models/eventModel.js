const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: 'String',
    required: [true, 'An event must have a name'],
  },
  description: {
    type: 'String',
    required: [true, 'An event must have a description'],
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'An event must have a host'],
  },
  availables: {
    food: { type: Boolean, default: false },
    drinks: { type: Boolean, default: false },
    music: { type: Boolean, default: false },
    games: { type: Boolean, default: false },
    wifi: { type: Boolean, default: false },
    restrooms: { type: Boolean, default: false },
  },
  startTime: {
    type: String,
    require: [true, 'An event must have a start time'],
  },
  date: {
    type: Date,
    required: [true, 'An event must have a day'],
  },
  price: {
    type: Number,
  },
  private: {
    type: Boolean,
    default: false,
  },
  displayCover: {
    type: String,
    default: 'default.jpg',
  },
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'],
    },
    coordinates: [Number],
    address: String,
  },
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
