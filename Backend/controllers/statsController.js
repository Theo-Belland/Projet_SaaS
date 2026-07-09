import Visit from '../models/Visit.js';

export const trackVisit = async (req, res) => {
  const { path, referrer = '' } = req.body;
  const userAgent = (req.headers['user-agent'] || '').slice(0, 200);
  await Visit.create({ path, referrer, userAgent });
  res.json({ success: true });
};

export const getStats = async (_req, res) => {
  const [total, visitsByDay, topPages] = await Promise.all([
    Visit.countDocuments(),
    Visit.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 30 },
    ]),
    Visit.aggregate([
      { $group: { _id: '$path', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
  ]);

  res.json({ total, visitsByDay, topPages });
};
