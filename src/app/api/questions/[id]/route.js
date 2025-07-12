import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Question from '@/models/Question';
import Answer from '@/models/Answer';
import User from '@/models/User';

export async function GET(req, context) {
  try {
    await dbConnect();

    // Await the params to get the id
    const { id } = await context.params;
    
    if (!id) {
      return NextResponse.json({ message: 'Question ID is required' }, { status: 400 });
    }

    // Find the question by ID and populate author
    const question = await Question.findById(id)
      .populate('author', 'name email role avatar reputation');

    if (!question) {
      return NextResponse.json({ message: 'Question not found' }, { status: 404 });
    }

    // Increment view count
    await Question.findByIdAndUpdate(id, { $inc: { views: 1 } });

    return NextResponse.json({ question }, { status: 200 });
  } catch (error) {
    console.error('Get question by ID error:', error);
    return NextResponse.json({ message: 'Failed to fetch question' }, { status: 500 });
  }
}