import { NextResponse } from 'next/server';
import connectDb from '../../../../lib/connectDb';
import Customer from '../../../../models/Customer';
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

export async function GET(request, { params }) {
  await connectDb();
  const { id } = params;
  try {
    const userId = await getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const customer = await Customer.findOne({ _id: id, userId: userId });
    if (!customer) {
      return NextResponse.json({ success: false, message: 'Customer not found or unauthorized' }, { status: 404 });
    }
    return NextResponse.json(customer, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  await connectDb();
  const { id } = params;
  try {
    const userId = await getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const body = await request.json();
    const updatedCustomer = await Customer.findOneAndUpdate(
      { _id: id, userId: userId },
      body,
      { new: true, runValidators: true }
    );
    if (!updatedCustomer) {
      return NextResponse.json({ success: false, message: 'Customer not found or unauthorized' }, { status: 404 });
    }
    return NextResponse.json(updatedCustomer, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  await connectDb();
  const { id } = params;
  try {
    const userId = await getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const deletedCustomer = await Customer.findOneAndDelete({ _id: id, userId: userId });
    if (!deletedCustomer) {
      return NextResponse.json({ success: false, message: 'Customer not found or unauthorized' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Customer deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}