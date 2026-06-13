import { useState, useEffect } from 'react';
import { getAllUsers, toggleUserStatus } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiSearch, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

const UsersAdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 10 };
      if (search) params.search = search;
      if (role) params.role = role;
      const { data } = await getAllUsers(params);
      setUsers(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, [role]);

  const handleToggle = async (userId, currentStatus) => {
    try {
      await toggleUserStatus(userId);
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'}`);
      load(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle user status');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">User Management</h1>

      <div className="card">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load(1)}
              placeholder="Search by name or email..."
              className="input-field pl-9"
            />
          </div>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field w-auto">
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>
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
                    {['Full Name', 'Email', 'Role', 'Status', 'Last Login', 'Joined', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{u.fullName}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{u.lastLogin ? formatDate(u.lastLogin) : 'Never'}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggle(u._id, u.isActive)}
                          className={`inline-flex items-center gap-1 text-sm font-medium ${
                            u.isActive ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'
                          }`}
                        >
                          {u.isActive ? <><FiToggleLeft /> Deactivate</> : <><FiToggleRight /> Activate</>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500">
              <span>{pagination.total} total users</span>
              <Pagination page={page} pages={pagination.pages} onPageChange={(p) => { setPage(p); load(p); }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UsersAdminPage;
