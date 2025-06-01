
import { NextResponse } from 'next/server';
import connectDb from '../../../../lib/connectDb';
import Sale from '../../../../models/Sale';
import { getUserIdFromRequest } from '../../../../lib/auth';


export async function GET(request, { params }) {
  await connectDb();
  const { id } = params;
  try {
    const userId = await getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const sale = await Sale.findOne({ _id: id, userId: userId });
    if (!sale) {
      return NextResponse.json({ success: false, message: 'Sale not found or unauthorized' }, { status: 404 });
    }
    return NextResponse.json(sale, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
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
    const deletedSale = await Sale.findOneAndDelete({ _id: id, userId: userId });
    if (!deletedSale) {
      return NextResponse.json({ success: false, message: 'Sale not found or unauthorized' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Sale deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}