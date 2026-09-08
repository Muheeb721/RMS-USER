import { Badge } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import NotificationDrawer from './NotificationDrawer';
import { markAllNotificationsAsRead, markNotificationAsRead, removeNotification, setNotifications } from '../../redux/store';
import { markNotificationAsReadOnServer } from '../../services/notificationService.jsx';
import { getUnreadCountFromServer, readSessionUser } from '../../services/notificationService.jsx';

function NotificationBell() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const notifications = useSelector((state) => Array.isArray(state.auth?.notifications) ? state.auth.notifications : []);
  const [isOpen, setIsOpen] = useState(false);
  const [serverUnread, setServerUnread] = useState(null);

  const unreadCount = notifications.filter((item) => item.unread !== false).length;

  const handleOpen = () => {
    const session = readSessionUser();
    const isAdmin = session?.role === 'admin';

    if (location.pathname === '/notifications' || (isAdmin && location.pathname === '/admin/notifications')) {
      setIsOpen((prev) => !prev);
      return;
    }

    if (!session?.email) {
      toast.info('Open notifications is available. Please log in to sync your personal alerts.');
      navigate('/notifications');
      return;
    }

    setIsOpen(true);
    if (session?.role === 'admin') navigate('/admin/notifications');
    else navigate('/notifications');
  };

  useEffect(() => {
    const session = readSessionUser();
    if (!session?.email) {
      setServerUnread(0);
      return undefined;
    }

    let mounted = true;
    (async () => {
      try {
        const res = await getUnreadCountFromServer();
        if (mounted && res.success) setServerUnread(res.data?.count ?? 0);
      } catch (e) {
        // ignore
      }
    })();

    return () => { mounted = false; };
  }, [location.pathname]);

  const handleMarkRead = (id) => {
    (async () => {
      try {
        const res = await markNotificationAsReadOnServer(id);
        if (res && res.success !== false && res.data) {
          dispatch(markNotificationAsRead(id));
        } else {
          // Fallback to local mark
          dispatch(markNotificationAsRead(id));
        }
      } catch (e) {
        dispatch(markNotificationAsRead(id));
      }
    })();
  };

  const handleMarkAllRead = () => {
    // Attempt to mark each unread notification on the server, then update local store
    (async () => {
      const unread = notifications.filter((n) => n.unread !== false).map((n) => n.id || n._id);
      for (const id of unread) {
        try {
          await markNotificationAsReadOnServer(id);
        } catch (e) {
          // ignore per-item errors
        }
      }
      dispatch(markAllNotificationsAsRead());
    })();
  };

  const handleDelete = (id) => {
    dispatch(removeNotification(id));
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleOpen}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
        aria-label="Open notifications"
      >
        <Badge count={serverUnread ?? unreadCount} showZero overflowCount={9}>
          <BellOutlined style={{ fontSize: 18 }} />
        </Badge>
      </button>

      {location.pathname === '/notifications' && (
        <NotificationDrawer
          open={isOpen}
          onClose={() => setIsOpen(false)}
          notifications={notifications}
          onMarkRead={handleMarkRead}
          onMarkAllRead={handleMarkAllRead}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default NotificationBell;
