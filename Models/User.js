const mongoose = require('mongoose');
const {Schema} = mongoose;
const bcrypt = require('bcryptjs');

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: [8, 'Password must be at least 8 character long.'],
    },
    role: {
      type: String,
      enum: ['User', 'Admin', 'Arthist'],
      default: 'User',
    },
    contacts: {
      type: Object,
    },
    description: {
      type: String,
      trim: true,
    },
    profilePic: {
      type: Object,
    },
  },
  {timestamps: true, collection: 'Users'}
);

UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  bcrypt.hash(this.password, 8, (err, hashedPassword) => {
    if (err) return next(err);
    this.password = hashedPassword;
    next();
  });
});

module.exports = mongoose.model('User', UserSchema);
