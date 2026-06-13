import { useState, useEffect } from 'react';
import { getAuditLogs } from '../../services/api';
import { formatDateTime } from '../../utils/helpers';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiShield } from 'react-icons/fi';

const ACTION_COLORS = {
  LOGIN: 'bg-green-100 text-green-700',
  REGISTER: 'bg-blue-100 text-blue-700',
  SUBMIT_APPLICATION: 'bg-purple-100 text-purple-700',
  APPLICATION_APPROVED: 'bg-green-100 text-green-700',
  APPLICATION_REJECTED: 'bg-red-100 text-red-700',
  APPLICATION_UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  MARK_PAYMENT_PAID: 'bg-green-100 text-green-700',
  GENERATE_PAYMENTS: 'bg-blue-100 text-blue-700',
};

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await getAuditLogs({ page: p, limit: 20 });
      setLogs(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FiShield className="h-6 w-6 text-primary-600" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                    {['Timestamp', 'User', 'Action', 'Entity', 'IP Address'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white text-xs">
                        {log.userId?.fullName || 'System'}
                        {log.userId?.role && <span className="text-gray-400 ml-1">({log.userId.role})</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{log.entity}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs font-mono">{log.ipAddress || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500">
              <span>{pagination.total} total logs</span>
              <Pagination page={page} pages={pagination.pages} onPageChange={(p) => { setPage(p); load(p); }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuditLogsPage;
