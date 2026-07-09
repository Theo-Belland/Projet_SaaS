import Skill from '../models/Skill.js';
import { AppError } from '../utils/AppError.js';

export const getSkills = async (_req, res) => {
  const skills = await Skill.find().sort({ order: 1, category: 1 });
  res.json(skills);
};

export const createSkill = async (req, res) => {
  const skill = await Skill.create(req.body);
  res.status(201).json(skill);
};

export const updateSkill = async (req, res) => {
  const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!skill) throw new AppError('Compétence introuvable', 404);
  res.json(skill);
};

export const deleteSkill = async (req, res) => {
  const skill = await Skill.findByIdAndDelete(req.params.id);
  if (!skill) throw new AppError('Compétence introuvable', 404);
  res.json({ success: true, message: 'Compétence supprimée' });
};
