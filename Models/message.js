const mongoose = require('mongoose');
const {Schema} = mongoose;
const message = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {timestamps: true, collection: 'Messages'}
);

module.exports = mongoose.model('Message', message);
