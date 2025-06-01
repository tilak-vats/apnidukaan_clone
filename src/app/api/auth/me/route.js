import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDb from '../../../../lib/connectDb';
import User from '../../../../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'kst_apnidukaan';

export async function GET(request) { 
  await connectDb();
  try {

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No token provided or invalid format' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1]; 

    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }

    if (!decoded.id) {
        return NextResponse.json({ message: 'Invalid token payload' }, { status: 400});
    }
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const userObject = user.toObject();
    return NextResponse.json({ user: userObject }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}