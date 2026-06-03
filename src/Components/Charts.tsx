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

const data = [
  { name: 'Jan', 'Product A': 1, 'Product B': 2 },
  { name: 'Feb', 'Product A': 2, 'Product B': 3 },
  { name: 'Mar', 'Product A': 3, 'Product B': 4 },
  { name: 'Apr', 'Product A': 4, 'Product B': 5 },
  { name: 'May', 'Product A': 5, 'Product B': 6 },
  { name: 'Jun', 'Product A': 6, 'Product B': 7 },
];

const Charts = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Units sold</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Product A" stroke="#6366f1" strokeWidth={2} />
            <Line type="monotone" dataKey="Product B" stroke="#22c55e" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;