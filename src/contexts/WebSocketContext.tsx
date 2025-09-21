// WebSocket Context for Tourist Safety Monitoring System
import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Tourist, Alert, GeofenceZone } from '../types';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

interface WebSocketContextType {
  socket: Socket | null;
  connected: boolean;
  onTouristLocationUpdate: (callback: (data: Tourist) => void) => void;
  onAnomalyAlert: (callback: (data: Alert) => void) => void;
  onZoneViolationAlert: (callback: (data: Alert) => void) => void;
  onZoneUpdate: (callback: (data: GeofenceZone) => void) => void;
  offTouristLocationUpdate: () => void;
  offAnomalyAlert: () => void;
  offZoneViolationAlert: () => void;
  offZoneUpdate: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

// Use environment variable for WebSocket URL, fallback to production backend
const WEBSOCKET_URL = process.env.REACT_APP_WS_URL || 'https://tourist-backend-latest.onrender.com';

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const { user, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();

  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 10;
  const reconnectInterval = 5000;

  const disconnectWebSocket = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setConnected(false);
    }
  }, [socket]);

  const joinDashboardRoom = useCallback((socketInstance: Socket) => {
    const currentPath = window.location.pathname;
    
    // Join appropriate dashboard room based on current path
    if (currentPath.includes('/admin') || currentPath.includes('/dashboard') || currentPath.includes('/geofence')) {
      socketInstance.emit('join_admin_dashboard', {
        user_data: {
          username: user?.username,
          role: user?.role
        }
      });

      // Listen for confirmation
      socketInstance.on('admin_dashboard_joined', (data) => {
        console.log('Joined admin dashboard room:', data);
      });
    } else if (currentPath.includes('/police')) {
      socketInstance.emit('join_police_dashboard', {
        user_data: {
          username: user?.username,
          badge_number: (user as any)?.badge_number || 'unknown'
        }
      });

      socketInstance.on('police_dashboard_joined', (data) => {
        console.log('Joined police dashboard room:', data);
      });
    }
  }, [user]);

  const setupSocketEventHandlers = useCallback((socketInstance: Socket) => {
    // Connection events
    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket server');
      setConnected(true);
      setReconnectAttempts(0);
      
      // Join appropriate dashboard room
      joinDashboardRoom(socketInstance);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setConnected(false);
      
      // Attempt to reconnect
      setTimeout(() => {
        if (reconnectAttempts < maxReconnectAttempts) {
          setReconnectAttempts(prev => prev + 1);
          console.log(`Reconnection attempt ${reconnectAttempts + 1}/${maxReconnectAttempts}`);
          socketInstance.connect();
        }
      }, reconnectInterval);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnected(false);
    });

    // High priority alerts that should show notifications
    socketInstance.on('high_priority_violation', (data: Alert) => {
      showNotification(
        `High Priority Alert: ${data.message}`,
        'danger',
        10000 // 10 seconds
      );
    });

    socketInstance.on('anomaly_alert', (data: Alert) => {
      if (data.severity === 'critical' || data.severity === 'high') {
        showNotification(
          `${data.severity.toUpperCase()} Alert: ${data.message}`,
          data.severity === 'critical' ? 'danger' : 'warning',
          8000
        );
      }
    });
  }, [reconnectAttempts, maxReconnectAttempts, reconnectInterval, showNotification, setReconnectAttempts, joinDashboardRoom]);

  const initializeWebSocket = useCallback(() => {
    try {
      const newSocket = io(WEBSOCKET_URL, {
        autoConnect: true,
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: reconnectInterval,
      });

      setSocket(newSocket);
      setupSocketEventHandlers(newSocket);
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }, [setupSocketEventHandlers, maxReconnectAttempts, reconnectInterval]);

  useEffect(() => {
    if (isAuthenticated() && user) {
      initializeWebSocket();
    } else {
      disconnectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [user, isAuthenticated, initializeWebSocket, disconnectWebSocket]);


  // Event listener registration methods
  const onTouristLocationUpdate = (callback: (data: Tourist) => void) => {
    if (socket) {
      socket.on('tourist_location_update', callback);
    }
  };

  const onAnomalyAlert = (callback: (data: Alert) => void) => {
    if (socket) {
      socket.on('anomaly_alert', callback);
    }
  };

  const onZoneViolationAlert = (callback: (data: Alert) => void) => {
    if (socket) {
      socket.on('zone_violation_alert', callback);
    }
  };

  const onZoneUpdate = (callback: (data: GeofenceZone) => void) => {
    if (socket) {
      socket.on('zone_update', callback);
    }
  };

  // Event listener removal methods
  const offTouristLocationUpdate = () => {
    if (socket) {
      socket.off('tourist_location_update');
    }
  };

  const offAnomalyAlert = () => {
    if (socket) {
      socket.off('anomaly_alert');
    }
  };

  const offZoneViolationAlert = () => {
    if (socket) {
      socket.off('zone_violation_alert');
    }
  };

  const offZoneUpdate = () => {
    if (socket) {
      socket.off('zone_update');
    }
  };

  const contextValue: WebSocketContextType = {
    socket,
    connected,
    onTouristLocationUpdate,
    onAnomalyAlert,
    onZoneViolationAlert,
    onZoneUpdate,
    offTouristLocationUpdate,
    offAnomalyAlert,
    offZoneViolationAlert,
    offZoneUpdate,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
