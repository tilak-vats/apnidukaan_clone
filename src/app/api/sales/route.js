import { NextResponse } from 'next/server';
import connectDb from '../../../lib/connectDb';
import Sale from '../../../models/Sale';
import { getUserIdFromRequest } from '../../../lib/auth';

export async function GET() {
  await connectDb();
  try {
    const userId = await getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const sales = await Sale.find({ userId: userId });
    return NextResponse.json(sales, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch sales' }, { status: 500 });
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
    const newSale = { ...body, userId: userId };

    const sale = await Sale.create(newSale);
    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}