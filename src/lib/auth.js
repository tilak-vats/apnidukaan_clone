// lib/auth.js
// Make sure this file exists and contains the updated getUserIdFromRequest
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Make sure your JWT_SECRET is consistent across your application (client and server)
const JWT_SECRET = process.env.JWT_SECRET || 'kst_apnidukaan';

export async function getUserIdFromRequest(request) {
  // Check for Authorization header first
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null; // No token or invalid format
  }

  const token = authHeader.split(' ')[1]; // Extract the token part

  if (!token) {
    return null; // Token is empty after split
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.id; // Return the user ID from the decoded token
  } catch (error) {
    // console.error("JWT verification failed:", error.message); // For debugging
    return null; // Token is invalid or expired
  }
}

// You might also export JWT_SECRET_KEY if needed elsewhere
export const JWT_SECRET_KEY = JWT_SECRET;