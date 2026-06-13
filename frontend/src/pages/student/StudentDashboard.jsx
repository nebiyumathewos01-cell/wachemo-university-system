import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyApplication, getMyPayments } from '../../services/api';
import { useNotifications } from '../../hooks/useNotifications';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, MONTHS } from '../../utils/helpers';
import { FiFileText, FiCreditCard, FiBell, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

const StudentDashboard = () => {
  const { user, student } = useAuth();
  const { notifications, unread } = useNotifications();
  const [application, setApplication] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [appRes, payRes] = await Promise.allSettled([getMyApplication(), getMyPayments()]);
        if (appRes.status === 'fulfilled') setApplication(appRes.value.data.data);
        if (payRes.status === 'fulfilled') setPayments(payRes.value.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  const paidPayments = payments.filter((p) => p.status === 'paid');
  const totalReceived = paidPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 rounded-xl p-6 text-white">
        <h1 className="text-xl font-bold mb-1">Welcome, {user?.fullName}! 👋</h1>
        <p className="text-primary-200 text-sm">
          {student ? `${student.department} • Year ${student.year} • ID: ${student.studentId}` : 'Complete your profile to get started'}
        </p>
        {!application && (
          <Link to="/dashboard/application" className="mt-4 inline-flex items-center gap-2 bg-white text-primary-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-50 transition-colors">
            Apply for Non-Cafeteria Program <FiArrowRight />
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Application Status"
          value={application ? <StatusBadge status={application.status} /> : 'Not Applied'}
          icon={FiFileText}
          color="blue"
        />
        <StatCard
          title="Total Received"
          value={`${totalReceived.toLocaleString()} ETB`}
          icon={FiCreditCard}
          color="green"
          sub={`${paidPayments.length} payment(s)`}
        />
        <StatCard
          title="Pending Payments"
          value={payments.filter((p) => p.status === 'pending').length}
          icon={FiCreditCard}
          color="yellow"
        />
        <StatCard
          title="Unread Notifications"
          value={unread}
          icon={FiBell}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Application Status</h2>
            <Link to="/dashboard/application" className="text-sm text-primary-600 hover:underline">View details</Link>
          </div>
          {application ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500">Status</span>
                <StatusBadge status={application.status} />
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500">Submitted</span>
                <span className="text-sm font-medium">{formatDate(application.submittedAt)}</span>
              </div>
              {application.status === 'rejected' && application.rejectionReason && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">Rejection Reason:</p>
                  <p className="text-xs text-red-600 dark:text-red-400">{application.rejectionReason}</p>
                </div>
              )}
              {application.status === 'approved' && application.approvalLetterPath && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <FiCheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 dark:text-green-300">Approval letter available</span>
                  <Link to="/dashboard/application" className="ml-auto text-xs text-green-600 hover:underline">Download</Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiFileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-4">No application submitted yet</p>
              <Link to="/dashboard/application" className="btn-primary text-sm">Apply Now</Link>
            </div>
          )}
        </div>

        {/* Recent payments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Payments</h2>
            <Link to="/dashboard/payments" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <FiCreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No payments yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {payments.slice(0, 5).map((p) => (
                <div key={p._id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{MONTHS[p.month - 1]} {p.year}</p>
                    <p className="text-xs text-gray-400">{p.paidDate ? formatDate(p.paidDate) : 'Pending'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{p.amount.toLocaleString()} ETB</p>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notifications preview */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Notifications</h2>
          <Link to="/dashboard/notifications" className="text-sm text-primary-600 hover:underline">View all</Link>
        </div>
        {notifications.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No notifications</p>
        ) : (
          <div className="space-y-2">
            {notifications.slice(0, 4).map((n) => (
              <div key={n._id} className={`flex gap-3 p-3 rounded-lg ${!n.read ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-700/30'}`}>
                <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${!n.read ? 'bg-blue-500' : 'bg-gray-300'}`} />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
