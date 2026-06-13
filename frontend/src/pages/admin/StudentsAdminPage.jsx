import { useState, useEffect } from 'react';
import { getAllStudents } from '../../services/api';
import { formatDate, DEPARTMENTS } from '../../utils/helpers';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiSearch, FiUser } from 'react-icons/fi';

const StudentsAdminPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 10 };
      if (search) params.search = search;
      if (department) params.department = department;
      if (year) params.year = year;
      const { data } = await getAllStudents(params);
      setStudents(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, [department, year]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Students</h1>

      <div className="card">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load(1)}
              placeholder="Search by name or student ID..."
              className="input-field pl-9"
            />
          </div>
          <select value={department} onChange={(e) => setDepartment(e.target.value)} className="input-field w-auto">
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(e.target.value)} className="input-field w-auto">
            <option value="">All Years</option>
            {[1,2,3,4,5,6].map((y) => <option key={y} value={y}>Year {y}</option>)}
          </select>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : students.length === 0 ? (
          <div className="text-center py-16 text-gray-400 flex flex-col items-center gap-3">
            <FiUser className="h-16 w-16 text-gray-200" />
            No students found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                    {['Full Name', 'Student ID', 'Email', 'Department', 'Year', 'Phone', 'Joined'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {students.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{s.userId?.fullName}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono">{s.studentId}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{s.userId?.email}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[140px] truncate">{s.department}</td>
                      <td className="px-4 py-3 text-gray-500">Year {s.year}</td>
                      <td className="px-4 py-3 text-gray-500">{s.phone}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(s.userId?.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500">
              <span>{pagination.total} total students</span>
              <Pagination page={page} pages={pagination.pages} onPageChange={(p) => { setPage(p); load(p); }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentsAdminPage;
