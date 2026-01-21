const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'other',
    },

    phone: { type: String },

    country: { type: String },

    profileImage: { type: String },

    isBlocked: { type: Boolean, default: false },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

//
// ✅ Password compare
//
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

//
// ✅ SAVE middleware (register / save)
//
userSchema.pre('save', async function (next) {
  try {
    // normalize gender
    if (this.gender) {
      this.gender = this.gender.toLowerCase();
    }

    // hash password
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    // default avatar
    if (!this.profileImage) {
      if (this.gender === 'male') {
        this.profileImage =
          'https://icon-library.com/images/male-avatar-icon/male-avatar-icon-5.jpg';
      } else if (this.gender === 'female') {
        this.profileImage =
          'https://icon-library.com/images/female-avatar-icon/female-avatar-icon-11.jpg';
      } else {
        this.profileImage =
          'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg';
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

//
// ✅ UPDATE middleware (findByIdAndUpdate, findOneAndUpdate)
//
userSchema.pre('findOneAndUpdate', async function (next) {
  try {
    const update = this.getUpdate();

    if (!update) return next();

    // normalize gender
    if (update.gender) {
      update.gender = update.gender.toLowerCase();
    }

    // hash password on update
    if (update.password) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(update.password, salt);
    }

    // default avatar if missing
    if (!update.profileImage && update.gender) {
      if (update.gender === 'male') {
        update.profileImage =
          'https://icon-library.com/images/male-avatar-icon/male-avatar-icon-5.jpg';
      } else if (update.gender === 'female') {
        update.profileImage =
          'https://icon-library.com/images/female-avatar-icon/female-avatar-icon-11.jpg';
      } else {
        update.profileImage =
          'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg';
      }
    }

    this.setUpdate(update);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
