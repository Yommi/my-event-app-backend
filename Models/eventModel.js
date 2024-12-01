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
  tags: {
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
  currency: {
    type: String,
    enum: ['cad', 'usd', 'eur', 'gbp', 'jpy', 'aud', 'inr'],
    lowercase: true,
    validate: {
      validator: function (value) {
        // Only validate (require) currency if price is provided
        if (this.price) {
          return value != null; // Check that currency is not null or undefined
        }
        return true; // If price is not set, currency is not required
      },
      message: 'Currency is required if price is provided',
    },
  },
  private: {
    type: Boolean,
    default: false,
  },
  displayCover: {
    type: String,
    default: 'default.jpg',
  },
  displayVideo: {
    type: String,
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

eventSchema.index({ location: '2dsphere' });

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
