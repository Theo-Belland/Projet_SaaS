import Article from '../models/Article.js';
import { AppError } from '../utils/AppError.js';

export const getArticles = async (_req, res) => {
  const articles = await Article.find({ published: true }).sort({ publishedAt: -1 });
  res.json(articles);
};

export const getArticleBySlug = async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug, published: true });
  if (!article) throw new AppError('Article introuvable', 404);
  res.json(article);
};

export const createArticle = async (req, res) => {
  const data = { ...req.body };
  if (data.published && !data.publishedAt) {
    data.publishedAt = new Date();
  }
  const article = await Article.create(data);
  res.status(201).json(article);
};

export const updateArticle = async (req, res) => {
  const current = await Article.findById(req.params.id);
  if (!current) throw new AppError('Article introuvable', 404);

  const data = { ...req.body };
  if (data.published && !current.published && !data.publishedAt) {
    data.publishedAt = new Date();
  }

  const article = await Article.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });
  res.json(article);
};

export const deleteArticle = async (req, res) => {
  const article = await Article.findByIdAndDelete(req.params.id);
  if (!article) throw new AppError('Article introuvable', 404);
  res.json({ success: true, message: 'Article supprimé' });
};
