export const errorHandler = (err, _req, res, _next) => {
  const status = err.status || 500;
  console.error(`[${status}] ${err.message}`);
  res.status(status).json({ message: err.message || 'Erreur interne du serveur' });
};
