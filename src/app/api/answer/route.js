import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Answer from '@/models/Answer';
import Question from '@/models/Question';
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

export async function POST(req) {
  try {
    await dbConnect();
    
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const { questionId, content } = await req.json();

    // Validation
    if (!questionId) {
      return NextResponse.json({ message: 'Question ID is required' }, { status: 400 });
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ message: 'Answer content is required' }, { status: 400 });
    }

    if (content.length < 10) {
      return NextResponse.json({ message: 'Answer must be at least 10 characters long' }, { status: 400 });
    }

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return NextResponse.json({ message: 'Question not found' }, { status: 404 });
    }

    // Check if question is closed
    if (question.isClosed) {
      return NextResponse.json({ message: 'Cannot answer a closed question' }, { status: 400 });
    }

    // Create the answer
    const answer = new Answer({
      content: content.trim(),
      question: questionId,
      owner: user._id,
    });

    await answer.save();

    // Add answer to question's answers array
    question.answers.push(answer._id);
    await question.save();

    // Populate answer details for response
    await answer.populate('owner', 'name email role');
    await answer.populate('question', 'title');

    return NextResponse.json({ 
      message: 'Answer created successfully',
      answer 
    }, { status: 201 });

  } catch (error) {
    console.error('Create answer error:', error);
    return NextResponse.json({ message: 'Failed to create answer' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get('questionId');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const sort = searchParams.get('sort') || 'newest';

    if (!questionId) {
      return NextResponse.json({ message: 'Question ID is required' }, { status: 400 });
    }

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return NextResponse.json({ message: 'Question not found' }, { status: 404 });
    }

    // Build sort options
    let sortOptions = {};
    switch (sort) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'mostVoted':
        sortOptions = { votes: -1 };
        break;
      case 'accepted':
        sortOptions = { accepted: -1, createdAt: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const answers = await Answer.find({ question: questionId })
      .populate('owner', 'name email role')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const total = await Answer.countDocuments({ question: questionId });
    const totalPages = Math.ceil(total / limit);

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
