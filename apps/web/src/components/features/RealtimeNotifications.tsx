'use client';

import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { X, Check, Info, AlertTriangle, AlertCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export default function RealtimeNotifications() {
  const { on, off } = useWebSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const handleNotification = (data: any) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type: data.type || 'info',
        title: data.title,
        message: data.message,
        timestamp: new Date(),
        read: false,
      };

      setNotifications((prev) => [notification, ...prev]);

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      }, 5000);
    };

    on('notification', handleNotification);

    return () => {
      off('notification', handleNotification);
    };
  }, [on, off]);

  const handleDismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <Check size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return {
          bg: '#d1fae5',
          border: '#10b981',
          text: '#065f46',
        };
      case 'warning':
        return {
          bg: '#fef3c7',
          border: '#f59e0b',
          text: '#92400e',
        };
      case 'error':
        return {
          bg: '#fee2e2',
          border: '#ef4444',
          text: '#991b1b',
        };
      default:
        return {
          bg: '#dbeafe',
          border: '#3b82f6',
          text: '#1e40af',
        };
    }
  };

  if (notifications.length === 0) {return null;}

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '400px',
      }}
    >
      {notifications.slice(0, 5).map((notification) => {
        const colors = getColor(notification.type);
        return (
          <div
            key={notification.id}
            style={{
              background: colors.bg,
              border: `2px solid ${colors.border}`,
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              animation: 'slideIn 0.3s ease-out',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: colors.border,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {getIcon(notification.type)}
            </div>

            <div style={{ flex: 1 }}>
              <h4
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.text,
                  marginBottom: '4px',
                }}
              >
                {notification.title}
              </h4>
              <p
                style={{
                  fontSize: '13px',
                  color: colors.text,
                  opacity: 0.8,
                  margin: 0,
                }}
              >
                {notification.message}
              </p>
              <p
                style={{
                  fontSize: '11px',
                  color: colors.text,
                  opacity: 0.6,
                  marginTop: '6px',
                }}
              >
                {notification.timestamp.toLocaleTimeString()}
              </p>
            </div>

            <button
              onClick={() => handleDismiss(notification.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: colors.text,
                opacity: 0.6,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
            >
              <X size={18} />
            </button>
          </div>
        );
      })}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
