import Project from '../models/Project.js';
import { AppError } from '../utils/AppError.js';

const parseList = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
  return [];
};

const buildImagePaths = (req, fallbackImages = []) => {
  const uploadedImages = (req.files ?? []).map((file) => `/uploads/projects/${file.filename}`);
  if (uploadedImages.length > 0) return uploadedImages;

  const bodyImages = parseList(req.body.images);
  if (bodyImages.length > 0) return bodyImages;

  if (typeof req.body.image === 'string' && req.body.image.trim()) return [req.body.image.trim()];

  return fallbackImages;
};

export const getProjects = async (_req, res) => {
  const projects = await Project.find({ published: true }).sort({ order: 1, createdAt: -1 });
  res.json(projects);
};

export const getAllProjects = async (_req, res) => {
  const projects = await Project.find().sort({ order: 1, createdAt: -1 });
  res.json(projects);
};

export const getProjectById = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new AppError('Projet introuvable', 404);
  res.json(project);
};

export const createProject = async (req, res) => {
  const images = buildImagePaths(req);
  const payload = {
    ...req.body,
    tags: parseList(req.body.tags),
    stack: parseList(req.body.stack),
    featured: req.body.featured === 'true' || req.body.featured === true,
    published: req.body.published === 'true' || req.body.published === true,
    order: req.body.order !== undefined ? Number(req.body.order) : 0,
    image: images[0] ?? '',
    images,
  };

  const project = await Project.create(payload);
  res.status(201).json(project);
};

export const updateProject = async (req, res) => {
  const existingProject = await Project.findById(req.params.id);
  if (!existingProject) throw new AppError('Projet introuvable', 404);

  const images = buildImagePaths(req, existingProject.images?.length ? existingProject.images : (existingProject.image ? [existingProject.image] : []));

  const payload = {
    ...req.body,
    tags: parseList(req.body.tags),
    stack: parseList(req.body.stack),
    featured: req.body.featured === 'true' || req.body.featured === true,
    published: req.body.published === 'true' || req.body.published === true,
    order: req.body.order !== undefined ? Number(req.body.order) : 0,
    image: images[0] ?? existingProject.image ?? '',
    images,
  };

  const project = await Project.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });
  res.json(project);
};

export const deleteProject = async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) throw new AppError('Projet introuvable', 404);
  res.json({ success: true, message: 'Projet supprimé' });
};
