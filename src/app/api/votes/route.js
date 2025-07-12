import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Answer from '@/models/Answer';
import Question from '@/models/Question';
import User from '@/models/User';
import Notification from '@/models/Notification';
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

    const { answerId, direction, questionId } = await req.json();

    // Validation
    if (!answerId) {
      return NextResponse.json({ message: 'Answer ID is required' }, { status: 400 });
    }

    if (!direction || !['up', 'down'].includes(direction)) {
      return NextResponse.json({ message: 'Invalid vote direction. Must be "up" or "down"' }, { status: 400 });
    }

    // Check if answer exists
    const answer = await Answer.findById(answerId);
    if (!answer) {
      return NextResponse.json({ message: 'Answer not found' }, { status: 404 });
    }

    // Check if user is voting on their own answer
    if (answer.owner.toString() === user._id.toString()) {
      return NextResponse.json({ message: 'You cannot vote on your own answer' }, { status: 400 });
    }

    // Check if question exists and is not closed
    if (questionId) {
      const question = await Question.findById(questionId);
      if (question && question.isClosed) {
        return NextResponse.json({ message: 'Cannot vote on answers to closed questions' }, { status: 400 });
      }
    }

    // Calculate vote update
    const update = direction === 'up' ? 1 : -1;

    // Update the answer's vote count
    const updatedAnswer = await Answer.findByIdAndUpdate(
      answerId,
      { $inc: { votes: update } },
      { new: true }
    ).populate('owner', 'name email role');

    if (!updatedAnswer) {
      return NextResponse.json({ message: 'Failed to update vote' }, { status: 500 });
    }

    // Create notification for the answer owner
    try {
      const voteType = direction === 'up' ? 'upvoted' : 'downvoted';
      const notificationMessage = `${user.name} ${voteType} your answer`;
      
      const notification = new Notification({
        user: answer.owner, // Notify the answer owner
        type: 'vote',
        message: notificationMessage,
        relatedQuestion: questionId,
        relatedAnswer: answerId,
        read: false
      });

      await notification.save();
    } catch (notificationError) {
      // Log notification error but don't fail the vote
      console.error('Failed to create vote notification:', notificationError);
    }

    return NextResponse.json({ 
      message: 'Vote updated successfully',
      answer: updatedAnswer,
      newVoteCount: updatedAnswer.votes
    }, { status: 200 });

  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ message: 'Failed to process vote' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await dbConnect();
    
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const answerId = searchParams.get('answerId');

    if (!answerId) {
      return NextResponse.json({ message: 'Answer ID is required' }, { status: 400 });
    }

    // Get answer with vote count
    const answer = await Answer.findById(answerId).populate('owner', 'name email role');
    
    if (!answer) {
      return NextResponse.json({ message: 'Answer not found' }, { status: 404 });
    }

    return NextResponse.json({
      answerId: answer._id,
      voteCount: answer.votes || 0,
      answer: answer
    }, { status: 200 });

  } catch (error) {
    console.error('Get vote error:', error);
    return NextResponse.json({ message: 'Failed to get vote information' }, { status: 500 });
  }
}
