import mongoose from 'mongoose';
const { Schema } = mongoose;

const NotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['answer', 'comment', 'mention', 'vote'], required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  relatedQuestion: { type: Schema.Types.ObjectId, ref: 'Question' },
  relatedAnswer: { type: Schema.Types.ObjectId, ref: 'Answer' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
