import { NextResponse } from 'next/server';
import connectDb from '../../../lib/connectDb';
import Product from '../../../models/Product';
import { getUserIdFromRequest } from '../../../lib/auth';

export async function GET(request) { // <-- ADD request here
  await connectDb();
  try {
    const userId = await getUserIdFromRequest(request); // <-- PASS request here
    if (!userId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const products = await Product.find({ userId: userId }).sort({ createdAt: -1 });
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Error in /api/products GET:", error); // Add console.error for debugging
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) { // <-- ADD request here
  await connectDb();
  try {
    const userId = await getUserIdFromRequest(request); 
    if (!userId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const newProduct = { ...body, userId: userId };

    const product = await Product.create(newProduct);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error in /api/products POST:", error); 
    if (error.code === 11000) {
      return NextResponse.json({ message: 'Product with this barcode already exists for this user.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}