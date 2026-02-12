import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

/**
 * The base URL used for the Socket.IO connection.
 * Falls back to the current host if REACT_APP_SOCKET_URL is not set.
 */
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || '';

/**
 * Reconnection configuration.
 */
const RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY = 1000;
const RECONNECT_DELAY_MAX = 30000;

/**
 * SocketProvider manages a Socket.IO connection that is tied to the
 * authentication state. When the user is authenticated a connection is
 * opened; when they log out the connection is closed.
 */
export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated, isDemoMode } = useAuth();

  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [connectionError, setConnectionError] = useState(null);

  const socketRef = useRef(null);
  const listenersRef = useRef(new Map());

  /**
   * Establish the Socket.IO connection.
   */
  const connect = useCallback(() => {
    // Don't connect in demo mode or without authentication
    if (isDemoMode || !isAuthenticated || !user) {
      return;
    }

    // Already connected
    if (socketRef.current?.connected) {
      return;
    }

    const token = localStorage.getItem('fluttrr_token');
    if (!token || token === 'demo-token') {
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: RECONNECT_ATTEMPTS,
      reconnectionDelay: RECONNECT_DELAY,
      reconnectionDelayMax: RECONNECT_DELAY_MAX,
      timeout: 20000,
      autoConnect: true,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);

      if (process.env.NODE_ENV === 'development') {
        console.log('[Socket] Connected:', socket.id);
      }
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);

      if (process.env.NODE_ENV === 'development') {
        console.log('[Socket] Disconnected:', reason);
      }
    });

    socket.on('connect_error', (error) => {
      setConnectionError(error.message);
      setIsConnected(false);

      if (process.env.NODE_ENV === 'development') {
        console.warn('[Socket] Connection error:', error.message);
      }
    });

    socket.on('reconnect', (attemptNumber) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
      }
    });

    socket.on('reconnect_failed', () => {
      setConnectionError('Failed to reconnect to server');

      if (process.env.NODE_ENV === 'development') {
        console.error('[Socket] Reconnection failed');
      }
    });

    // Handle online users list
    socket.on('users:online', (userIds) => {
      setOnlineUsers(new Set(userIds));
    });

    socket.on('user:online', (userId) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.add(userId);
        return next;
      });
    });

    socket.on('user:offline', (userId) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    socketRef.current = socket;
  }, [isAuthenticated, isDemoMode, user]);

  /**
   * Disconnect the socket.
   */
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setOnlineUsers(new Set());
      listenersRef.current.clear();
    }
  }, []);

  // Connect/disconnect based on auth state
  useEffect(() => {
    if (isAuthenticated && !isDemoMode) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, isDemoMode, connect, disconnect]);

  /**
   * Subscribe to a socket event. Returns an unsubscribe function.
   */
  const on = useCallback((event, callback) => {
    if (!socketRef.current) return () => {};

    socketRef.current.on(event, callback);

    // Track for cleanup
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event).add(callback);

    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, callback);
      }
      listenersRef.current.get(event)?.delete(callback);
    };
  }, []);

  /**
   * Emit a socket event.
   */
  const emit = useCallback((event, ...args) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, ...args);
    } else if (process.env.NODE_ENV === 'development') {
      console.warn('[Socket] Cannot emit -- not connected:', event);
    }
  }, []);

  // --- Chat-specific convenience methods ---

  /**
   * Join a chat room.
   */
  const joinRoom = useCallback(
    (roomId) => {
      emit('chat:join', { roomId });
    },
    [emit]
  );

  /**
   * Leave a chat room.
   */
  const leaveRoom = useCallback(
    (roomId) => {
      emit('chat:leave', { roomId });
    },
    [emit]
  );

  /**
   * Send a message in a chat room.
   */
  const sendMessage = useCallback(
    (roomId, content, type = 'text', metadata = {}) => {
      emit('chat:message', { roomId, content, type, metadata });
    },
    [emit]
  );

  /**
   * Mark messages in a room as read.
   */
  const markAsRead = useCallback(
    (roomId) => {
      emit('chat:read', { roomId });
    },
    [emit]
  );

  /**
   * Signal that the current user started typing.
   */
  const startTyping = useCallback(
    (roomId) => {
      emit('chat:typing:start', { roomId });
    },
    [emit]
  );

  /**
   * Signal that the current user stopped typing.
   */
  const stopTyping = useCallback(
    (roomId) => {
      emit('chat:typing:stop', { roomId });
    },
    [emit]
  );

  /**
   * Add a reaction to a message.
   */
  const addReaction = useCallback(
    (messageId, emoji) => {
      emit('chat:reaction', { messageId, emoji });
    },
    [emit]
  );

  const value = {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
    connectionError,
    on,
    emit,
    joinRoom,
    leaveRoom,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    addReaction,
    connect,
    disconnect,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

/**
 * Hook to access the socket context.
 * @returns {Object} Socket context value
 */
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
