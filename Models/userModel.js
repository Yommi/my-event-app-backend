const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
  },
  username: {
    type: String,
    required: [true, 'A user must have a username'],
    unique: [true, 'username already taken'],
  },
  email: {
    type: String,
    lowercase: true,
    required: [true, 'A user must have an enail address'],
    unique: true,
    validate: [validator.isEmail, 'please provide a valid email address'],
  },
  role: {
    type: String,
    required: [true, 'A user must have a role'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'A user must confirm their password'],
    validate: {
      validator: function (conf) {
        return conf === this.password;
      },
    },
  },
  profilePhoto: {
    type: String,
    default: 'default.jpg',
  },
  Events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
  passwordChangedAt: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  unencryptedPassword,
  encryptedPassword
) {
  return await bcrypt.compare(unencryptedPassword, encryptedPassword);
};

userSchema.methods.createPasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 60 * 1000;
  return resetToken;
};

userSchema.methods.checkIfPasswordChanged = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const User = new mongoose.model('User', userSchema);
module.exports = User;
