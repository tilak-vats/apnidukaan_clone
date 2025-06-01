import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDb from '../../../../lib/connectDb';
import User from '../../../../models/User';
export async function POST(request) {
  await connectDb();
  try {
    const body = await request.json();
    const { email, password, shopName, ownerName, phoneNumber, category, location } = body;

    if (!email || !password || !shopName || !ownerName || !phoneNumber || !category || !location) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const user = await User.create({ email, password, shopName, ownerName, phoneNumber, category, location });

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userResponseData = {
      _id: user._id,
      shopName: user.shopName,
      ownerName: user.ownerName,
      email: user.email,
      location: user.location,
      category: user.category,
      phoneNumber: user.phoneNumber,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    return NextResponse.json(
      { message: 'Signup successful', token, user: userResponseData },
      { status: 201 }
    );

  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}