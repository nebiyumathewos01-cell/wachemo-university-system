import { useState, useEffect } from 'react';
import { getAllPayments, generateMonthlyPayments, markAsPaid, exportPaymentsExcel, exportPaymentsPDF, getPaymentStats } from '../../services/api';
import { MONTHS, formatDate, downloadBlob } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiDownload, FiCheck } from 'react-icons/fi';

const PaymentsAdminPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [payModal, setPayModal] = useState(null); // payment to mark as paid
  const [transRef, setTransRef] = useState('');
  const [accountConfirm, setAccountConfirm] = useState('');
  const [accountError, setAccountError] = useState('');
  const [genModal, setGenModal] = useState(false);
  const [genForm, setGenForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 10 };
      if (filterMonth) params.month = filterMonth;
      if (filterYear) params.year = filterYear;
      if (filterStatus !== 'all') params.status = filterStatus;
      if (search) params.search = search;

      const { data } = await getAllPayments(params);
      setPayments(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, [filterMonth, filterYear, filterStatus]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data } = await generateMonthlyPayments(genForm);
      toast.success(data.message);
      setGenModal(false);
      load(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkPaid = async () => {
    // Verify admin entered the correct account number
    if (!transRef.trim()) {
      toast.error('Please enter a transaction reference');
      return;
    }
    if (accountConfirm.trim() !== payModal.student?.accountNumber?.trim()) {
      setAccountError('❌ Wrong account number. Please check and try again.');
      return;
    }
    try {
      await markAsPaid(payModal._id, { transactionRef: transRef });
      toast.success('Payment marked as paid');
      setPayModal(null);
      setTransRef('');
      setAccountConfirm('');
      setAccountError('');
      load(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark as paid');
    }
  };

  const handleExportExcel = async () => {
    try {
      const params = {};
      if (filterMonth) params.month = filterMonth;
      if (filterYear) params.year = filterYear;
      const { data } = await exportPaymentsExcel(params);
      downloadBlob(data, `payments_${filterMonth || 'all'}_${filterYear || 'all'}.xlsx`);
      toast.success('Excel exported successfully');
    } catch { toast.error('Export failed'); }
  };

  const handleExportPDF = async () => {
    try {
      const params = {};
      if (filterMonth) params.month = filterMonth;
      if (filterYear) params.year = filterYear;
      const { data } = await exportPaymentsPDF(params);
      downloadBlob(data, `payments_${filterMonth || 'all'}_${filterYear || 'all'}.pdf`);
      toast.success('PDF exported successfully');
    } catch { toast.error('Export failed'); }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Payment Management</h1>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleExportExcel} className="btn-secondary text-sm gap-1"><FiDownload /> Excel</button>
          <button onClick={handleExportPDF} className="btn-secondary text-sm gap-1"><FiDownload /> PDF</button>
          <button onClick={() => setGenModal(true)} className="btn-primary text-sm gap-1"><FiPlus /> Generate Payments</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load(1)}
              placeholder="Search student name or ID..."
              className="input-field pl-9"
            />
          </div>
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="input-field w-auto">
            <option value="">All Months</option>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="input-field w-auto">
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-auto">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : payments.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No payment records found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                    {['Student', 'ID', 'Bank', 'Account', 'Period', 'Amount', 'Status', 'Paid Date', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {payments.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{p.user?.fullName || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{p.student?.studentId || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{p.student?.bankName || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{p.student?.accountNumber || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{MONTHS[(p.month || 1) - 1]} {p.year}</td>
                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">{p.amount?.toLocaleString()} ETB</td>
                      <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-3 text-gray-500">{p.paidDate ? formatDate(p.paidDate) : '—'}</td>
                      <td className="px-4 py-3">
                        {p.status === 'pending' && (
                          <button onClick={() => setPayModal(p)} className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 text-sm font-medium">
                            <FiCheck className="h-3 w-3" /> Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500">
              <span>{pagination.total} total records</span>
              <Pagination page={page} pages={pagination.pages} onPageChange={(p) => { setPage(p); load(p); }} />
            </div>
          </>
        )}
      </div>

      {/* Generate payments modal */}
      {genModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generate Monthly Payments</h3>
            <p className="text-sm text-gray-500 mb-4">This will create payment records for all approved students for the selected period.</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month</label>
                <select value={genForm.month} onChange={(e) => setGenForm({ ...genForm, month: parseInt(e.target.value) })} className="input-field">
                  {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                <select value={genForm.year} onChange={(e) => setGenForm({ ...genForm, year: parseInt(e.target.value) })} className="input-field">
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setGenModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleGenerate} disabled={generating} className="btn-primary">
                {generating ? <LoadingSpinner size="sm" /> : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark as paid modal */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Confirm Payment</h3>
            <p className="text-sm text-gray-500 mb-4">
              Processing <strong>{payModal.user?.fullName}</strong> — {MONTHS[(payModal.month || 1) - 1]} {payModal.year} — <strong>{payModal.amount?.toLocaleString()} ETB</strong>
            </p>

            {/* Student bank info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-4">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">📋 Student Bank Details</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-blue-500">Bank:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-100">{payModal.student?.bankName || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-500">Account Holder:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-100">{payModal.student?.accountHolderName || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-500">Account No (masked):</span>
                  <span className="font-mono font-bold text-blue-900 dark:text-white">
                    {'*'.repeat(Math.max(0, (payModal.student?.accountNumber?.length || 0) - 4))}
                    {payModal.student?.accountNumber?.slice(-4) || '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Account number confirmation */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Enter Student's Account Number to Confirm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={accountConfirm}
                onChange={(e) => {
                  setAccountConfirm(e.target.value.replace(/\D/g, ''));
                  setAccountError('');
                }}
                className={`input-field font-mono tracking-widest ${accountError ? 'border-red-400 focus:ring-red-400' : accountConfirm && accountConfirm === payModal.student?.accountNumber ? 'border-green-400 focus:ring-green-400' : ''}`}
                placeholder="Type full account number here"
                autoComplete="off"
              />
              {/* Error */}
              {accountError && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg flex items-start gap-2">
                  <span className="text-red-500 text-base mt-0.5">✗</span>
                  <div>
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">Wrong Account Number</p>
                    <p className="text-xs text-red-500 mt-0.5">The account number you entered does not match the student's registered account. Please verify and try again.</p>
                  </div>
                </div>
              )}
              {/* Success */}
              {accountConfirm && !accountError && accountConfirm === payModal.student?.accountNumber && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <span>✓</span> Account number verified successfully
                </p>
              )}
            </div>

            {/* Transaction reference */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Transaction Reference <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={transRef}
                onChange={(e) => setTransRef(e.target.value)}
                className="input-field"
                placeholder="Bank transaction ID / reference number"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setPayModal(null); setTransRef(''); setAccountConfirm(''); setAccountError(''); }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleMarkPaid} className="btn-primary gap-2">
                <FiCheck /> Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsAdminPage;
