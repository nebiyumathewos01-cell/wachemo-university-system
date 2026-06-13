import { useNotifications } from '../../hooks/useNotifications';
import { formatDateTime } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiBell, FiTrash2, FiCheck } from 'react-icons/fi';

const NotificationsPage = () => {
  const { notifications, unread, loading, markRead, markAllRead, remove } = useNotifications();

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Notifications {unread > 0 && <span className="text-base font-normal text-gray-400">({unread} unread)</span>}
        </h1>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn-secondary text-sm gap-2">
            <FiCheck /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card text-center py-16">
          <FiBell className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`card flex gap-4 ${!n.read ? 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/10' : ''}`}
            >
              <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${!n.read ? 'bg-blue-500' : 'bg-gray-300'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDateTime(n.createdAt)}</p>
              </div>
              <div className="flex items-start gap-2">
                {!n.read && (
                  <button onClick={() => markRead(n._id)} className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-lg" title="Mark as read">
                    <FiCheck className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => remove(n._id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg" title="Delete">
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
