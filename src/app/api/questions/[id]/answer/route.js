import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Answer from '@/models/Answer';
import Question from '@/models/Question';

export async function GET(req, context) {
  try {
    await dbConnect();

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

    // Find all answers for this question and populate owner details
    const answers = await Answer.find({ question: id })
      .populate('owner', 'name email role avatar reputation')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

      console.log("answers: ",answers);

    return NextResponse.json({ 
      answers,
      pagination: {
        currentPage: page,
        totalPages,
        totalAnswers: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Get answers error:', error);
    return NextResponse.json({ message: 'Failed to fetch answers' }, { status: 500 });
  }
}