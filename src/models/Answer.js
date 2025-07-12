import mongoose from 'mongoose';
const { Schema } = mongoose;

const AnswerSchema = new Schema({
  content: { type: String, required: true },
  question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  votes: { type: Number, default: 0 },
  accepted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Answer || mongoose.model('Answer', AnswerSchema);
