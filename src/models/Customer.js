import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  name: { type: String },
  email: { type: String },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

CustomerSchema.index({ phoneNumber: 1, userId: 1 }, { unique: true });

CustomerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});
CustomerSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);