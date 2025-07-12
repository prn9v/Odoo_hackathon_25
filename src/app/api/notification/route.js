import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Notification from '@/models/Notification';
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    // Build query
    let query = { user: user._id };
    if (unreadOnly) {
      query.read = false;
    }

    const skip = (page - 1) * limit;

    const notifications = await Notification.find(query)
      .populate('relatedQuestion', 'title')
      .populate('relatedAnswer', 'content')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get unread count
    const unreadCount = await Notification.countDocuments({ 
      user: user._id, 
      read: false 
    });

    return NextResponse.json({
      notifications,
      pagination: {
        currentPage: page,
        totalPages,
        totalNotifications: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      unreadCount
    }, { status: 200 });

  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json({ message: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const { type, message, relatedQuestion, relatedAnswer } = await req.json();

    // Validation
    if (!type || !['answer', 'comment', 'mention', 'vote'].includes(type)) {
      return NextResponse.json({ message: 'Invalid notification type' }, { status: 400 });
    }

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ message: 'Notification message is required' }, { status: 400 });
    }

    // Create notification
    const notification = new Notification({
      user: user._id,
      type,
      message: message.trim(),
      relatedQuestion,
      relatedAnswer,
      read: false
    });

    await notification.save();

    // Populate related data for response
    await notification.populate('relatedQuestion', 'title');
    await notification.populate('relatedAnswer', 'content');

    return NextResponse.json({ 
      message: 'Notification created successfully',
      notification 
    }, { status: 201 });

  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json({ message: 'Failed to create notification' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const { notificationId, action } = await req.json();

    if (!action || !['mark-read', 'mark-unread', 'delete', 'mark-all-read'].includes(action)) {
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    // Handle mark-all-read action
    if (action === 'mark-all-read') {
      const result = await Notification.updateMany(
        { user: user._id, read: false },
        { read: true }
      );

      return NextResponse.json({ 
        message: 'All notifications marked as read',
        updatedCount: result.modifiedCount
      }, { status: 200 });
    }

    // For other actions, notificationId is required
    if (!notificationId) {
      return NextResponse.json({ message: 'Notification ID is required' }, { status: 400 });
    }

    // Check if notification exists and belongs to user
    const notification = await Notification.findOne({ 
      _id: notificationId, 
      user: user._id 
    });

    if (!notification) {
      return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
    }

    let updateData = {};
    
    switch (action) {
      case 'mark-read':
        updateData = { read: true };
        break;
      case 'mark-unread':
        updateData = { read: false };
        break;
      case 'delete':
        await Notification.findByIdAndDelete(notificationId);
        return NextResponse.json({ 
          message: 'Notification deleted successfully' 
        }, { status: 200 });
    }

    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      updateData,
      { new: true }
    ).populate('relatedQuestion', 'title')
     .populate('relatedAnswer', 'content');

    return NextResponse.json({ 
      message: 'Notification updated successfully',
      notification: updatedNotification
    }, { status: 200 });

  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json({ message: 'Failed to update notification' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();
    
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action'); // 'all' or 'read'

    let query = { user: user._id };
    
    if (action === 'read') {
      query.read = true;
    }

    const result = await Notification.deleteMany(query);

    return NextResponse.json({ 
      message: `Deleted ${result.deletedCount} notifications successfully`,
      deletedCount: result.deletedCount
    }, { status: 200 });

  } catch (error) {
    console.error('Delete notifications error:', error);
    return NextResponse.json({ message: 'Failed to delete notifications' }, { status: 500 });
  }
}
