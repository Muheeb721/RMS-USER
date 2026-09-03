import { useEffect } from 'react';
import {
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

function NotificationDrawer({
  open,
  onClose,
  notifications = [],
  onMarkRead,
  onMarkAllRead,
  onDelete,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const unreadCount = notifications.filter((item) => item.unread !== false).length;

  const getTypeMeta = (type) => {
    switch (type) {
      case 'maintenance':
        return { icon: <ExclamationCircleOutlined className="text-amber-500" />, color: 'bg-amber-100 text-amber-700' };
      case 'rent':
        return { icon: <CheckCircleOutlined className="text-emerald-500" />, color: 'bg-emerald-100 text-emerald-700' };
      case 'system':
        return { icon: <InfoCircleOutlined className="text-sky-500" />, color: 'bg-sky-100 text-sky-700' };
      default:
        return { icon: <BellOutlined className="text-indigo-500" />, color: 'bg-indigo-100 text-indigo-700' };
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[99998] transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className="fixed top-0 right-0 h-full w-full md:w-[40vw] max-w-[480px] bg-white shadow-2xl z-[99999] flex flex-col transform transition-transform duration-300 ease-out"
        aria-label="Notifications drawer"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
              <BellOutlined className="text-lg" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">Notifications</h3>
              <p className="text-xs text-slate-500">{unreadCount} unread</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Close <CloseOutlined />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {notifications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
              No notifications yet.
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const isUnread = notification.unread !== false;
                const meta = getTypeMeta(notification.type);

                return (
                  <div
                    key={notification.id || `${notification.title}-${notification.createdAt}`}
                    className={`rounded-2xl border p-4 transition ${
                      isUnread ? 'border-indigo-200 bg-indigo-50/50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${meta.color}`}>
                          {meta.icon}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-900">{notification.title || 'New update'}</p>
                            {isUnread && (
                              <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                                New
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {notification.message || notification.body || 'No details available.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <ClockCircleOutlined />
                        {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Just now'}
                      </div>

                      <div className="flex items-center gap-2">
                        {isUnread && (
                          <button
                            type="button"
                            onClick={() => onMarkRead?.(notification.id)}
                            className="rounded-full border border-indigo-200 bg-white px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
                          >
                            Mark read
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onDelete?.(notification.id)}
                          className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 bg-white p-4">
          <button
            type="button"
            onClick={onMarkAllRead}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Mark all as read
          </button>
        </div>
      </aside>
    </>
  );
}

export default NotificationDrawer;
