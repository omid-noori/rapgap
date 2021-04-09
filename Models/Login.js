const mongoose = require('mongoose');
const {Schema} = mongoose;

const LoginSchema = new Schema({
  userName: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    trim: true,
  },
});

module.exports = mongoose.model('Login', LoginSchema);
