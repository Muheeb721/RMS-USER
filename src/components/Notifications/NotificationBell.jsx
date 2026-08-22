import { useEffect, useRef, useState } from 'react';
import { Badge } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { markAllNotificationsAsRead, clearNotifications, markNotificationAsRead, removeNotification } from '../../redux/store';
import NotificationPanel from './NotificationPanel';

function NotificationBell() {
  const dispatch = useDispatch();
  const bellRef = useRef(null);
  const [open, setOpen] = useState(false);
  const { notifications } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((item) => item.unread).length;

  return (
    <div ref={bellRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#0b2450',
          padding: '8px 10px',
          borderRadius: '50%',
        }}
        aria-label="Open notifications"
      >
        <Badge count={unreadCount} showZero>
          <BellOutlined style={{ fontSize: 18 }} />
        </Badge>
      </button>

      {open ? (
        <NotificationPanel
          notifications={notifications}
          onMarkRead={(id) => dispatch(markNotificationAsRead(id))}
          onDelete={(id) => dispatch(removeNotification(id))}
          onMarkAllRead={() => dispatch(markAllNotificationsAsRead())}
          onClear={() => dispatch(clearNotifications())}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}

export default NotificationBell;
