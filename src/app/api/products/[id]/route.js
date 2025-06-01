import { NextResponse } from 'next/server';
import connectDb from '../../../../lib/connectDb';
import Product from '../../../../models/Product';
import { getUserIdFromRequest } from '../../../../lib/auth';

export async function GET(request, { params }) { // <-- ADD request here
  await connectDb();
  const { id } = params;
  try {
    const userId = await getUserIdFromRequest(request); // <-- PASS request here
    if (!userId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const product = await Product.findOne({ _id: id, userId: userId });
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found or unauthorized' }, { status: 404 });
    }
    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error(`Error in /api/products/${id} GET:`, error); // Add console.error for debugging
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) { // <-- ADD request here
  await connectDb();
  const { id } = params;
  try {
    const userId = await getUserIdFromRequest(request); // <-- PASS request here
    if (!userId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const body = await request.json();
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id, userId: userId },
      body,
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      return NextResponse.json({ success: false, message: 'Product not found or unauthorized' }, { status: 404 });
    }
    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error(`Error in /api/products/${id} PUT:`, error); // Add console.error for debugging
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) { // <-- ADD request here
  await connectDb();
  const { id } = params;
  try {
    const userId = await getUserIdFromRequest(request); // <-- PASS request here
    if (!userId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const deletedProduct = await Product.findOneAndDelete({ _id: id, userId: userId });
    if (!deletedProduct) {
      return NextResponse.json({ success: false, message: 'Product not found or unauthorized' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Product deleted' }, { status: 200 });
  } catch (error) {
    console.error(`Error in /api/products/${id} DELETE:`, error); // Add console.error for debugging
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}