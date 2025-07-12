
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from '@/models/User';
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";

export async function POST(req) {
  try {
    await dbConnect();
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 400 });
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 400 });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET || "your-secret-key", 
      { expiresIn: "1h" }
    );

    // Return user data without password
    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    };

    return NextResponse.json({ user: userResponse, token }, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}