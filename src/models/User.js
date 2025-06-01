// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  shopName: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  location: { type: String, required: true },
  category: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function(next) {
  console.log('[User Model Pre-Save Hook] - Attempting to save user:', this.email);
  console.log('[User Model Pre-Save Hook] - Is password modified?', this.isModified('password'));

  if (!this.isModified('password')) {
    console.log('[User Model Pre-Save Hook] - Password not modified, skipping hashing.');
    return next();
  }

  try {
    console.log('[User Model Pre-Save Hook] - Hashing password...');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('[User Model Pre-Save Hook] - Password hashed successfully. Proceeding to save.');
    next();
  } catch (error) {
    console.error('[User Model Pre-Save Hook] - Error during password hashing:', error);
    next(error); // Pass the error to Mongoose
  }
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;