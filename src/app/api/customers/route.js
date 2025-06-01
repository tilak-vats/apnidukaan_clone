import { NextResponse } from 'next/server';
import connectDb from '../../../lib/connectDb';
import Customer from '../../../models/Customer';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

async function getUserIdFromRequest() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'kst_apnidukaan');
    return decoded.id;
  } catch (error) {
    return null;
  }
}

export async function GET() {
  await connectDb();
  try {
    const userId = await getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const customers = await Customer.find({ userId: userId });
    return NextResponse.json(customers, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request) {
  await connectDb();
  try {
    const userId = await getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const newCustomer = { ...body, userId: userId };

    const customer = await Customer.create(newCustomer);
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ message: 'Customer with this phone number already exists for this user.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}