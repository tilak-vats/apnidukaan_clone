import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDb from '../../../../lib/connectDb';
import User from '../../../../models/User';

export async function POST(request) {
  await connectDb();
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

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
      { message: 'Login successful', token, user: userResponseData },
      { status: 200 }
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