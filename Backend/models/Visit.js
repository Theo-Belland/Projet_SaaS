import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema({
  path:      { type: String, required: true },
  referrer:  { type: String, default: '' },
  userAgent: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Visit', visitSchema);
