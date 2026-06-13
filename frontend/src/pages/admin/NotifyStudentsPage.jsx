import { useState } from 'react';
import { sendBroadcastNotification } from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiBell, FiSend } from 'react-icons/fi';

const NotifyStudentsPage = () => {
  const [form, setForm] = useState({ title: '', message: '', type: 'system', targetRole: 'student' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Title and message are required');
      return;
    }
    setSending(true);
    try {
      const { data } = await sendBroadcastNotification(form);
      toast.success(data.message);
      setForm({ title: '', message: '', type: 'system', targetRole: 'student' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <FiBell className="h-6 w-6 text-primary-600" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Send Notification</h1>
      </div>

      <div className="card">
        <p className="text-sm text-gray-500 mb-6">
          Send a broadcast notification to all active students or admins. All matching users will receive the notification instantly.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Audience *</label>
            <select value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })} className="input-field">
              <option value="student">All Students</option>
              <option value="admin">All Admins</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notification Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
              <option value="system">System</option>
              <option value="application">Application</option>
              <option value="payment">Payment</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field"
              placeholder="Notification title..."
              maxLength={100}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message *</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="input-field resize-none"
              rows={5}
              placeholder="Write your notification message here..."
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{form.message.length}/500</p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              ⚠️ This notification will be sent to <strong>all active {form.targetRole}s</strong>. Please review before sending.
            </p>
          </div>

          <button type="submit" disabled={sending} className="btn-primary w-full py-2.5 gap-2">
            {sending ? <LoadingSpinner size="sm" /> : <FiSend />}
            {sending ? 'Sending...' : 'Send Notification'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NotifyStudentsPage;
