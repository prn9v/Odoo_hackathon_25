import mongoose from 'mongoose';
const { Schema } = mongoose;

const QuestionSchema = new Schema({
  title: { 
    type: String, 
    required: true,
    minlength: 10,
    maxlength: 200
  },
  description: { 
    type: String, 
    required: true,
    minlength: 20
  },
  author: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  tags: [{ 
    type: String,
    trim: true,
    lowercase: true
  }],
  votes: { 
    type: Number, 
    default: 0 
  },
  views: { 
    type: Number, 
    default: 0 
  },
  answers: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Answer' 
  }],
  acceptedAnswer: { 
    type: Schema.Types.ObjectId, 
    ref: 'Answer' 
  },
  isClosed: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt field before saving
QuestionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add text index for search functionality
QuestionSchema.index({ 
  title: 'text', 
  description: 'text', 
  tags: 'text' 
});

const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);

export default Question; 