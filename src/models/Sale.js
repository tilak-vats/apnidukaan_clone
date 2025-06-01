import mongoose from 'mongoose';

const SaleItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  barcode: { type: String },
  discountedPrice: { type: Number, required: true, min: 0 },
  cartQuantity: { type: Number, required: true, min: 1 },
});

const SaleSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerPhone: { type: String, required: true },
  total: { type: Number, required: true, min: 0 },
  items: [SaleItemSchema],
  date: { type: Date, default: Date.now },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

SaleSchema.pre('save', function(next) {
  this.date = Date.now();
  next();
});

export default mongoose.models.Sale || mongoose.model('Sale', SaleSchema);