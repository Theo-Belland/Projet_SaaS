import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    name: String,
    email: String,
    subject: String,
    normalizedSubject: String,
    message: String,
    read: {type: Boolean, default: false},
    replies: [
      {
        text: String,
        sentAt: {type: Date, default: Date.now}
      }
    ]
}, {timestamps: true});

export default mongoose.model("Message", MessageSchema);