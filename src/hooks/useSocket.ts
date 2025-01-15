import { useEffect, useRef, useCallback } from 'react';
import { GameState } from '../types/game';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:3001';

interface UseSocketProps {
  onGameCreated?: (gameId: string) => void;
  onGameJoined?: (gameId: string) => void;
  onPlayerJoined?: (data: { playerCount: number }) => void;
  onPlayerLeft?: (data: { playerCount: number }) => void;
  onError?: (error: string) => void;
}

export function useSocket({
  onGameCreated,
  onGameJoined,
  onPlayerJoined,
  onPlayerLeft,
  onError
}: UseSocketProps = {}) {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    try {
      console.log('Connecting to socket server at:', SOCKET_URL);
      socketRef.current = new WebSocket(SOCKET_URL);

      // Set up event listeners
      socketRef.current.onopen = () => {
        console.log('Socket connected');
      };

      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received message:', data);

          switch (data.type) {
            case 'gameCreated':
              onGameCreated?.(data.gameId);
              break;
            case 'gameJoined':
              onGameJoined?.(data.gameId);
              break;
            case 'playerJoined':
              onPlayerJoined?.(data);
              break;
            case 'playerLeft':
              onPlayerLeft?.(data);
              break;
            case 'error':
              onError?.(data.message);
              break;
          }
        } catch (error) {
          console.error('Error parsing message:', error);
          onError?.('Failed to parse server message');
        }
      };

      socketRef.current.onerror = (error) => {
        console.error('Socket error:', error);
        onError?.('WebSocket error occurred');
      };

      socketRef.current.onclose = () => {
        console.log('Socket disconnected');
      };

      // Cleanup on unmount
      return () => {
        if (socketRef.current) {
          console.log('Cleaning up socket connection');
          socketRef.current.close();
          socketRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing socket:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to connect to server');
    }
  }, [onGameCreated, onGameJoined, onPlayerJoined, onPlayerLeft, onError]);

  const sendMessage = useCallback((type: string, data?: Record<string, unknown>) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      console.log('Sending message:', { type, data });
      socketRef.current.send(JSON.stringify({ type, ...data }));
    } else {
      console.error('Socket not connected');
      onError?.('Not connected to server');
    }
  }, [onError]);

  const createGame = useCallback(() => {
    sendMessage('createGame');
  }, [sendMessage]);

  const joinGame = useCallback((gameId: string) => {
    sendMessage('joinGame', { gameId });
  }, [sendMessage]);

  const updateGameState = useCallback((gameId: string, gameState: GameState) => {
    sendMessage('updateGameState', { gameId, gameState });
  }, [sendMessage]);

  return {
    socket: socketRef.current,
    createGame,
    joinGame,
    updateGameState
  };
} 