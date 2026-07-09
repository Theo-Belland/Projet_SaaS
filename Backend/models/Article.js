import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  slug:        { type: String, required: true, unique: true },
  content:     { type: String, required: true },
  excerpt:     { type: String, default: '' },
  tags:        [{ type: String }],
  published:   { type: Boolean, default: false },
  publishedAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model('Article', articleSchema);
