import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title:           { type: String, required: true },
  description:     { type: String, required: true },
  longDescription: { type: String, default: '' },
  tags:            [{ type: String }],
  stack:           [{ type: String }],
  github:          { type: String, default: '' },
  demo:            { type: String, default: '' },
  image:           { type: String, default: '' },
  images:          { type: [String], default: [] },
  featured:        { type: Boolean, default: false },
  order:           { type: Number, default: 0 },
  published:       { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
