import { NextResponse } from 'next/server';
import connectDb from '../../../lib/connectDb';
import Product from '../../../models/Product';
import Customer from '../../../models/Customer';
import Sale from '../../../models/Sale';
import mongoose from 'mongoose';

// POST for the checkout process
export async function POST(request) {
  await connectDb();

  const body = await request.json();
  const { customerPhone, cart } = body;

  if (!customerPhone || !cart || cart.length === 0) {
    return NextResponse.json(
      { success: false, message: 'Customer phone and cart items are required.' },
      { status: 400 }
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let customer = await Customer.findOne({ phoneNumber: customerPhone }).session(session);
    let customerId;

    if (!customer) {
      customer = await Customer.create([{ phoneNumber: customerPhone }], { session });
      customerId = customer[0]._id;
    } else {
      customerId = customer._id;
      await Customer.findByIdAndUpdate(customerId, { updatedAt: Date.now() }).session(session);
    }

    const saleItems = [];
    let totalSaleAmount = 0;

    for (const item of cart) {
      const product = await Product.findById(item.id).session(session);

      if (!product || product.quantity < item.cartQuantity) {
        throw new Error(`Product "${item.name}" (ID: ${item.id}) is out of stock or insufficient quantity.`);
      }

      await Product.findByIdAndUpdate(product._id, {
        $inc: { quantity: -item.cartQuantity },
        updatedAt: Date.now()
      }, { session });

      saleItems.push({
        productId: product._id,
        name: product.name,
        barcode: product.barcode,
        discountedPrice: item.discountedPrice,
        cartQuantity: item.cartQuantity,
      });
      totalSaleAmount += item.discountedPrice * item.cartQuantity;
    }

    const newSale = await Sale.create([{
      customerId: customerId,
      customerPhone: customerPhone,
      items: saleItems,
      total: totalSaleAmount,
      date: Date.now(),
    }], { session });

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({ success: true, message: 'Checkout successful', sale: newSale[0] }, { status: 200 });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Checkout failed:', error);
    return NextResponse.json({ success: false, message: 'Checkout failed', error: error.message }, { status: 500 });
  }
}