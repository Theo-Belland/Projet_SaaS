import { useEffect, useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type StatsResponse = {
  total: number;
  visitsByDay: Array<{ _id: string; count: number }>;
  topPages: Array<{ _id: string; count: number }>;
};

const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

const Charts = () => {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${apiBase}/api/stats`, {
          headers: token ? { Authorization: token } : {},
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || 'Impossible de charger les statistiques');
        }

        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const chartData = useMemo(() => {
    if (!stats?.visitsByDay) return [];

    return [...stats.visitsByDay]
      .reverse()
      .map((item) => ({
        date: item._id.slice(5),
        Visites: item.count,
      }));
  }, [stats]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Visites du site</h2>
          <p className="text-sm text-slate-500">Compteur global: {stats?.total ?? 0}</p>
        </div>
        {stats?.topPages?.[0] ? (
          <div className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
            Top page: {stats.topPages[0]._id} ({stats.topPages[0].count})
          </div>
        ) : null}
      </div>

      <div className="h-80">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">Chargement des statistiques...</div>
        ) : error ? (
          <div className="flex h-full items-center justify-center text-sm text-rose-600">{error}</div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">Aucune visite enregistrée pour le moment.</div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Visites" stroke="#06b6d4" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Charts;