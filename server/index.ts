import { createServer } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { GameState } from '../src/types/game';

const httpServer = createServer();
const wss = new WebSocketServer({ server: httpServer });

interface GameRoom {
  gameId: string;
  players: WebSocket[];
  gameState: GameState | null;
}

interface Message {
  type: string;
  gameId?: string;
  gameState?: GameState;
  [key: string]: unknown;
}

const games = new Map<string, GameRoom>();

function broadcast(clients: WebSocket[], message: unknown): void {
  const data = JSON.stringify(message);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');

  ws.on('message', (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString()) as Message;
      console.log('Received message:', message);

      switch (message.type) {
        case 'createGame': {
          const gameId = Math.random().toString(36).substring(7);
          console.log('Creating game:', gameId);
          games.set(gameId, {
            gameId,
            players: [ws],
            gameState: null
          });
          ws.send(JSON.stringify({ type: 'gameCreated', gameId }));
          break;
        }

        case 'joinGame': {
          const { gameId } = message;
          if (!gameId) {
            ws.send(JSON.stringify({ type: 'error', message: 'Game ID is required' }));
            return;
          }

          const game = games.get(gameId);
          if (!game) {
            ws.send(JSON.stringify({ type: 'error', message: 'Game not found' }));
            return;
          }

          if (game.players.length >= 4) {
            ws.send(JSON.stringify({ type: 'error', message: 'Game is full' }));
            return;
          }

          game.players.push(ws);
          ws.send(JSON.stringify({ type: 'gameJoined', gameId }));
          broadcast(game.players, { 
            type: 'playerJoined', 
            playerCount: game.players.length 
          });
          break;
        }

        case 'updateGameState': {
          const { gameId, gameState } = message;
          if (!gameId || !gameState) {
            ws.send(JSON.stringify({ type: 'error', message: 'Game ID and state are required' }));
            return;
          }

          const game = games.get(gameId);
          if (game) {
            game.gameState = gameState as GameState;
            broadcast(game.players.filter(player => player !== ws), { 
              type: 'gameStateUpdated', 
              gameState 
            });
          }
          break;
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    for (const [gameId, game] of games.entries()) {
      const playerIndex = game.players.indexOf(ws);
      if (playerIndex !== -1) {
        game.players.splice(playerIndex, 1);
        if (game.players.length === 0) {
          games.delete(gameId);
        } else {
          broadcast(game.players, { 
            type: 'playerLeft', 
            playerCount: game.players.length 
          });
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
}); 