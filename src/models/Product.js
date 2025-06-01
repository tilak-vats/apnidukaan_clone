import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  barcode: { type: String, required: true, unique: false },
  originalPrice: { type: Number, required: true, min: 0 },
  discountedPrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0 },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ProductSchema.index({ barcode: 1, userId: 1 }, { unique: true });

ProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.isModified('originalPrice') || this.isModified('discountedPrice') || this.isNew) {
    if (this.discountedPrice > this.originalPrice) {
      const error = new Error('Discounted price cannot be greater than original price.');
      return next(error);
    }
  }
  next();
});

ProductSchema.pre('findOneAndUpdate', async function(next) {
  this.set({ updatedAt: Date.now() });

  const update = this.getUpdate();
  const docToUpdate = await this.model.findOne(this.getQuery());

  let originalPrice = docToUpdate.originalPrice;
  let discountedPrice = docToUpdate.discountedPrice;

  if (update.originalPrice !== undefined) {
    originalPrice = update.originalPrice;
  }
  if (update.discountedPrice !== undefined) {
    discountedPrice = update.discountedPrice;
  }

  if (discountedPrice > originalPrice) {
    const error = new Error('Discounted price cannot be greater than original price.');
    return next(error);
  }

  next();
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);