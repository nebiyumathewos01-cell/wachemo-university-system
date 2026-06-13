import { useState, useEffect } from 'react';
import { getMyPayments } from '../../services/api';
import { MONTHS, formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiCreditCard } from 'react-icons/fi';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getMyPayments();
        setPayments(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalReceived = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === 'pending').length;

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Payment History</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">{totalReceived.toLocaleString()} ETB</p>
          <p className="text-sm text-gray-500 mt-1">Total Received</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-yellow-600">{totalPending}</p>
          <p className="text-sm text-gray-500 mt-1">Pending Payments</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary-600">{payments.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total Records</p>
        </div>
      </div>

      {/* Payments table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Payment Records</h2>
        </div>
        {payments.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <FiCreditCard className="h-16 w-16 text-gray-200 mb-4" />
            <p className="text-gray-400">No payment records yet.</p>
            <p className="text-sm text-gray-400 mt-1">Payments will appear here once your application is approved.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {MONTHS[p.month - 1]} {p.year}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                      {p.amount.toLocaleString()} ETB
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                    <td className="px-6 py-4 text-gray-500">{p.paidDate ? formatDate(p.paidDate) : '—'}</td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{p.transactionRef || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;
