import { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/api';
import { formatDate, MONTHS } from '../../utils/helpers';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  FiUsers, FiFileText, FiCheckCircle, FiXCircle, FiClock, FiCreditCard, FiDollarSign,
} from 'react-icons/fi';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getDashboardStats();
        setStats(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" text="Loading dashboard..." /></div>;
  if (!stats) return null;

  // Format chart data
  const chartData = MONTHS.slice(0, 12).map((month, i) => {
    const stat = stats.monthlyStats.find((s) => s._id === i + 1);
    return { month: month.slice(0, 3), amount: stat?.totalAmount || 0, count: stat?.count || 0 };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={stats.students.total} icon={FiUsers} color="blue" />
        <StatCard title="Pending Applications" value={stats.applications.pending} icon={FiClock} color="yellow" sub={`${stats.applications.underReview} under review`} />
        <StatCard title="Approved" value={stats.applications.approved} icon={FiCheckCircle} color="green" />
        <StatCard title="Rejected" value={stats.applications.rejected} icon={FiXCircle} color="red" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Payments" value={stats.payments.total} icon={FiCreditCard} color="purple" />
        <StatCard title="Paid" value={stats.payments.paid} icon={FiCheckCircle} color="green" />
        <StatCard title="Pending Payments" value={stats.payments.pending} icon={FiDollarSign} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly payment chart */}
        <div className="card lg:col-span-2">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Payment Distribution ({new Date().getFullYear()})</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v.toLocaleString()} ETB`} />
              <Legend />
              <Bar dataKey="amount" name="Amount (ETB)" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Application breakdown */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Application Breakdown</h2>
          <div className="space-y-3">
            {[
              { label: 'Total', value: stats.applications.total, color: 'bg-gray-200' },
              { label: 'Pending', value: stats.applications.pending, color: 'bg-yellow-400' },
              { label: 'Under Review', value: stats.applications.underReview, color: 'bg-blue-400' },
              { label: 'Approved', value: stats.applications.approved, color: 'bg-green-400' },
              { label: 'Rejected', value: stats.applications.rejected, color: 'bg-red-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent applications */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Applications</h2>
          <Link to="/admin/applications" className="text-sm text-primary-600 hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {stats.recentApplications.map((app) => (
                <tr key={app._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {app.studentId?.userId?.fullName || '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{app.studentId?.studentId || '—'}</td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(app.submittedAt)}</td>
                  <td className="px-6 py-4"><StatusBadge status={app.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
