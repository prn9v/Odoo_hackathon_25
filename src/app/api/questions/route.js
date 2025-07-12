import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
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

    const { title, description, tags } = await req.json();

    // Validation
    if (!title || !description) {
      return NextResponse.json({ message: 'Title and description are required' }, { status: 400 });
    }

    if (title.length < 10) {
      return NextResponse.json({ message: 'Title must be at least 10 characters long' }, { status: 400 });
    }

    if (description.length < 20) {
      return NextResponse.json({ message: 'Description must be at least 20 characters long' }, { status: 400 });
    }

    const question = new Question({
      title,
      description,
      tags: tags || [],
      author: user._id,
    });

    await question.save();

    // Populate author details for response
    await question.populate('author', 'name email role');

    return NextResponse.json({ 
      message: 'Question created successfully',
      question 
    }, { status: 201 });

  } catch (error) {
    console.error('Create question error:', error);
    return NextResponse.json({ message: 'Failed to create question' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'newest';

    // Build query
    let query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
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
      case 'unanswered':
        query.answers = { $size: 0 };
        sortOptions = { createdAt: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    // Ensure Question model is available
    if (!Question) {
      throw new Error('Question model not found');
    }

    const questions = await Question.find(query)
      .populate('author', 'name email role')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const total = await Question.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      questions,
      pagination: {
        currentPage: page,
        totalPages,
        totalQuestions: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Get questions error:', error);
    return NextResponse.json({ message: 'Failed to fetch questions' }, { status: 500 });
  }
}
