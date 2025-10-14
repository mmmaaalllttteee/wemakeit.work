import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionDelay?: number;
  reconnectionAttempts?: number;
}

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
  connect: () => void;
  disconnect: () => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    autoConnect = true,
    reconnection = true,
    reconnectionDelay = 1000,
    reconnectionAttempts = 5,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {return;}

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No auth token found, WebSocket connection skipped');
      return;
    }

    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001/realtime', {
      auth: {
        token,
      },
      reconnection,
      reconnectionDelay,
      reconnectionAttempts,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    socketRef.current = socket;
  }, [reconnection, reconnectionDelay, reconnectionAttempts]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn(`Cannot emit "${event}": Socket not connected`);
    }
  }, []);

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    socket: socketRef.current,
    isConnected,
    emit,
    on,
    off,
    connect,
    disconnect,
  };
}

// ==================== Specialized Hooks ====================

/**
 * Hook for board real-time collaboration
 */
export function useBoardCollaboration(boardId: string | null) {
  const { isConnected, emit, on, off } = useWebSocket();
  const [activeUsers, setActiveUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!boardId || !isConnected) {return;}

    // Join board room
    emit('join:board', { boardId });

    // Listen for users
    const handleUserJoined = (data: any) => {
      setActiveUsers((prev) => [...prev, data]);
    };

    const handleUserLeft = (data: any) => {
      setActiveUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    };

    on('user:joined:board', handleUserJoined);
    on('user:left:board', handleUserLeft);

    return () => {
      emit('leave:board', { boardId });
      off('user:joined:board', handleUserJoined);
      off('user:left:board', handleUserLeft);
    };
  }, [boardId, isConnected, emit, on, off]);

  const updateTask = useCallback(
    (taskId: string, updates: any) => {
      emit('task:update', { boardId, taskId, updates });
    },
    [boardId, emit],
  );

  const moveTask = useCallback(
    (taskId: string, fromColumnId: string, toColumnId: string, position: number) => {
      emit('task:move', { boardId, taskId, fromColumnId, toColumnId, position });
    },
    [boardId, emit],
  );

  return {
    activeUsers,
    updateTask,
    moveTask,
    isConnected,
    on,
    off,
  };
}

/**
 * Hook for moodboard real-time collaboration
 */
export function useMoodboardCollaboration(moodboardId: string | null) {
  const { isConnected, emit, on, off } = useWebSocket();
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [cursors, setCursors] = useState<Map<string, { x: number; y: number; userName: string }>>(
    new Map(),
  );

  useEffect(() => {
    if (!moodboardId || !isConnected) {return;}

    // Join moodboard room
    emit('join:moodboard', { moodboardId });

    // Listen for users
    const handleUserJoined = (data: any) => {
      setActiveUsers((prev) => [...prev, data]);
    };

    const handleUserLeft = (data: any) => {
      setActiveUsers((prev) => prev.filter((u) => u.userId !== data.userId));
      setCursors((prev) => {
        const newCursors = new Map(prev);
        newCursors.delete(data.userId);
        return newCursors;
      });
    };

    // Listen for cursor movements
    const handleCursorMoved = (data: any) => {
      setCursors((prev) => {
        const newCursors = new Map(prev);
        newCursors.set(data.userId, {
          x: data.x,
          y: data.y,
          userName: data.userName,
        });
        return newCursors;
      });

      // Remove cursor after 5 seconds of inactivity
      setTimeout(() => {
        setCursors((prev) => {
          const newCursors = new Map(prev);
          const cursor = newCursors.get(data.userId);
          if (cursor && cursor.x === data.x && cursor.y === data.y) {
            newCursors.delete(data.userId);
          }
          return newCursors;
        });
      }, 5000);
    };

    on('user:joined:moodboard', handleUserJoined);
    on('user:left:moodboard', handleUserLeft);
    on('cursor:moved', handleCursorMoved);

    return () => {
      emit('leave:moodboard', { moodboardId });
      off('user:joined:moodboard', handleUserJoined);
      off('user:left:moodboard', handleUserLeft);
      off('cursor:moved', handleCursorMoved);
    };
  }, [moodboardId, isConnected, emit, on, off]);

  const moveCursor = useCallback(
    (x: number, y: number) => {
      emit('cursor:move', { moodboardId, x, y });
    },
    [moodboardId, emit],
  );

  const updateItem = useCallback(
    (itemId: string, updates: any) => {
      emit('item:update', { moodboardId, itemId, updates });
    },
    [moodboardId, emit],
  );

  const lockItem = useCallback(
    (itemId: string) => {
      emit('item:lock', { moodboardId, itemId });
    },
    [moodboardId, emit],
  );

  const unlockItem = useCallback(
    (itemId: string) => {
      emit('item:unlock', { moodboardId, itemId });
    },
    [moodboardId, emit],
  );

  return {
    activeUsers,
    cursors: Array.from(cursors.entries()).map(([userId, cursor]) => ({
      userId,
      ...cursor,
    })),
    moveCursor,
    updateItem,
    lockItem,
    unlockItem,
    isConnected,
    on,
    off,
  };
}

/**
 * Hook for typing indicators
 */
export function useTypingIndicator(resourceType: string, resourceId: string | null) {
  const { isConnected, emit } = useWebSocket();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startTyping = useCallback(() => {
    if (!resourceId || !isConnected) {return;}

    emit('typing:start', { resourceType, resourceId });

    // Auto-stop after 3 seconds
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [resourceType, resourceId, isConnected, emit]);

  const stopTyping = useCallback(() => {
    if (!resourceId || !isConnected) {return;}

    emit('typing:stop', { resourceType, resourceId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [resourceType, resourceId, isConnected, emit]);

  useEffect(() => () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }, []);

  return {
    startTyping,
    stopTyping,
  };
}
