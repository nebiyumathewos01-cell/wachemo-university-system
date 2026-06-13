import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllApplications } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiSearch, FiFilter, FiEye } from 'react-icons/fi';

const STATUS_OPTIONS = ['all', 'pending', 'under_review', 'approved', 'rejected'];

const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await getAllApplications({ page: p, limit: 10, status, search });
      setApplications(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); setPage(1); }, [status]);

  const handleSearch = (e) => {
    e.preventDefault();
    load(1);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Applications</h1>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, student ID, department..."
                className="input-field pl-9"
              />
            </div>
            <button type="submit" className="btn-primary gap-2">
              <FiSearch /> Search
            </button>
          </form>
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400 h-4 w-4" />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field w-auto">
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s === 'all' ? 'All Status' : s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No applications found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                    {['Student Name', 'Student ID', 'Department', 'Year', 'Submitted', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {app.user?.fullName || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{app.student?.studentId || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[140px] truncate">{app.student?.department || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">Year {app.student?.year}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(app.submittedAt)}</td>
                      <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                      <td className="px-4 py-3">
                        <Link to={`/admin/applications/${app._id}`} className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-800 text-sm font-medium">
                          <FiEye className="h-4 w-4" /> Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Showing {applications.length} of {pagination.total} results</span>
                <Pagination page={page} pages={pagination.pages} onPageChange={(p) => { setPage(p); load(p); }} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ApplicationsPage;
