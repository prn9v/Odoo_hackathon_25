import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

// Helper function to get user from token
const getSessionUser = async (req) => {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    
    const user = await User.findById(decoded.id).select('-password');
    return user;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

export async function GET(req) {
  try {
    await dbConnect();
    
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    return NextResponse.json(user, { status: 200 });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ message: 'Failed to fetch user data' }, { status: 500 });
  }
} 