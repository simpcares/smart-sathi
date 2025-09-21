import React from 'react';
import { useNotification } from '../contexts/NotificationContext';

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  const getAlertClass = (type: string) => {
    const classMap: { [key: string]: string } = {
      'success': 'alert-success',
      'danger': 'alert-danger',
      'warning': 'alert-warning',
      'info': 'alert-info'
    };
    return classMap[type] || 'alert-info';
  };

  const getIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      'success': 'fas fa-check-circle',
      'danger': 'fas fa-exclamation-triangle',
      'warning': 'fas fa-exclamation-circle',
      'info': 'fas fa-info-circle'
    };
    return iconMap[type] || 'fas fa-info-circle';
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`alert ${getAlertClass(notification.type)} alert-dismissible fade show mb-2`}
          role="alert"
          style={{ minWidth: '300px' }}
        >
          <i className={`${getIcon(notification.type)} me-2`}></i>
          <strong>{notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}:</strong> {notification.message}
          <button
            type="button"
            className="btn-close"
            onClick={() => removeNotification(notification.id)}
            aria-label="Close"
          ></button>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;