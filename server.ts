/**
 * ==============================================================================
 * Memory Match Game - Full-Stack Express & Real-Time WebSocket Server
 * File: server.ts
 * Description: Authoritative real-time server managing multiplayer rooms,
 *              matchmaking, card decks, turn sync, and serving the client app.
 * ==============================================================================
 */

import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = Number(process.env.PORT) || 3000;

// Emoji deck library
const EMOJI_POOL = [
  '🍎', '🚗', '🐱', '🐶', '🍕', '⚽', '🚀', '🌟',
  '🍦', '🎈', '🎸', '🦄', '🍩', '🥑', '🎮', '🌈',
  '💎', '🌮', '🐼', '🌻', '⚡', '👑', '🏀', '🔥',
];

const DIFFICULTY_MAP: Record<string, number> = {
  easy: 4,     // 8 cards
  medium: 8,   // 16 cards
  hard: 12,    // 24 cards
};

interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  pairs: number;
  ws: WebSocket;
}

interface Room {
  id: string;
  difficulty: string;
  deck: string[];
  players: Player[];
  turnIndex: number;
  firstFlippedIndex: number | null;
  matchedIndices: number[];
  status: 'waiting' | 'playing' | 'ended';
  turnTimer: NodeJS.Timeout | null;
  turnTimeLeft: number;
}

const rooms = new Map<string, Room>();

// Fisher-Yates Shuffle
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return rooms.has(result) ? generateRoomId() : result;
}

function createDeck(difficulty: string): string[] {
  const pairs = DIFFICULTY_MAP[difficulty] || 8;
  const pool = shuffle(EMOJI_POOL);
  const selected = pool.slice(0, pairs);
  return shuffle([...selected, ...selected]);
}

// Attach WebSocket Server
const wss = new WebSocketServer({ server, path: '/ws' });

function broadcastToRoom(room: Room, message: object) {
  const payload = JSON.stringify(message);
  for (const player of room.players) {
    if (player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(payload);
    }
  }
}

function sendToPlayer(player: Player, message: object) {
  if (player.ws.readyState === WebSocket.OPEN) {
    player.ws.send(JSON.stringify(message));
  }
}

function startTurnTimer(room: Room) {
  if (room.turnTimer) clearInterval(room.turnTimer);
  room.turnTimeLeft = 15;

  room.turnTimer = setInterval(() => {
    room.turnTimeLeft--;
    broadcastToRoom(room, {
      type: 'turn_tick',
      timeLeft: room.turnTimeLeft,
      turnIndex: room.turnIndex,
    });

    if (room.turnTimeLeft <= 0) {
      clearInterval(room.turnTimer!);
      room.turnTimer = null;

      // Turn timeout: if one card was open, reset it
      const resetIndex = room.firstFlippedIndex;
      room.firstFlippedIndex = null;
      room.turnIndex = room.turnIndex === 0 ? 1 : 0;

      broadcastToRoom(room, {
        type: 'turn_timeout',
        nextTurnIndex: room.turnIndex,
        resetCardIndex: resetIndex,
      });

      startTurnTimer(room);
    }
  }, 1000);
}

wss.on('connection', (ws: WebSocket) => {
  let currentRoomId: string | null = null;
  let playerId: string = Math.random().toString(36).substring(2, 9);

  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw.toString());

      // 1. Create Room
      if (data.type === 'create_room') {
        const difficulty = data.difficulty || 'medium';
        const roomId = generateRoomId();
        const deck = createDeck(difficulty);

        const room: Room = {
          id: roomId,
          difficulty,
          deck,
          players: [
            {
              id: playerId,
              name: data.playerName || 'Player 1',
              avatar: data.avatar || '🦊',
              score: 0,
              pairs: 0,
              ws,
            },
          ],
          turnIndex: 0,
          firstFlippedIndex: null,
          matchedIndices: [],
          status: 'waiting',
          turnTimer: null,
          turnTimeLeft: 15,
        };

        rooms.set(roomId, room);
        currentRoomId = roomId;

        sendToPlayer(room.players[0], {
          type: 'room_created',
          roomId,
          playerId,
          playerIndex: 0,
          difficulty,
          cardCount: deck.length,
        });
      }

      // 2. Join Room (By Code or Quick Match)
      else if (data.type === 'join_room' || data.type === 'quick_match') {
        let targetRoom: Room | undefined;

        if (data.type === 'quick_match') {
          // Find any open waiting room with the preferred difficulty
          for (const r of rooms.values()) {
            if (r.status === 'waiting' && r.players.length === 1) {
              targetRoom = r;
              break;
            }
          }
          if (!targetRoom) {
            // No waiting room found; create one automatically
            const difficulty = data.difficulty || 'medium';
            const roomId = generateRoomId();
            const deck = createDeck(difficulty);
            targetRoom = {
              id: roomId,
              difficulty,
              deck,
              players: [
                {
                  id: playerId,
                  name: data.playerName || 'Player 1',
                  avatar: data.avatar || '🦊',
                  score: 0,
                  pairs: 0,
                  ws,
                },
              ],
              turnIndex: 0,
              firstFlippedIndex: null,
              matchedIndices: [],
              status: 'waiting',
              turnTimer: null,
              turnTimeLeft: 15,
            };
            rooms.set(roomId, targetRoom);
            currentRoomId = roomId;
            sendToPlayer(targetRoom.players[0], {
              type: 'room_created',
              roomId,
              playerId,
              playerIndex: 0,
              difficulty,
              cardCount: deck.length,
            });
            return;
          }
        } else {
          const reqCode = (data.roomId || '').trim().toUpperCase();
          targetRoom = rooms.get(reqCode);
        }

        if (!targetRoom) {
          ws.send(JSON.stringify({ type: 'error', message: 'Room code not found. Please verify the code.' }));
          return;
        }

        if (targetRoom.players.length >= 2 || targetRoom.status !== 'waiting') {
          ws.send(JSON.stringify({ type: 'error', message: 'This room is already full or in progress.' }));
          return;
        }

        // Add 2nd player to room
        const player2: Player = {
          id: playerId,
          name: data.playerName || 'Player 2',
          avatar: data.avatar || '🐼',
          score: 0,
          pairs: 0,
          ws,
        };

        targetRoom.players.push(player2);
        targetRoom.status = 'playing';
        currentRoomId = targetRoom.id;

        // Broadcast game start to both players
        broadcastToRoom(targetRoom, {
          type: 'game_start',
          roomId: targetRoom.id,
          difficulty: targetRoom.difficulty,
          cardCount: targetRoom.deck.length,
          turnIndex: 0,
          players: targetRoom.players.map((p, idx) => ({
            id: p.id,
            name: p.name,
            avatar: p.avatar,
            score: p.score,
            pairs: p.pairs,
            index: idx,
          })),
        });

        startTurnTimer(targetRoom);
      }

      // 3. Card Flip
      else if (data.type === 'flip_card') {
        if (!currentRoomId) return;
        const room = rooms.get(currentRoomId);
        if (!room || room.status !== 'playing') return;

        const activePlayer = room.players[room.turnIndex];
        if (activePlayer.id !== playerId) {
          // Not this player's turn!
          return;
        }

        const cardIndex = Number(data.cardIndex);
        if (
          cardIndex < 0 ||
          cardIndex >= room.deck.length ||
          room.matchedIndices.includes(cardIndex) ||
          room.firstFlippedIndex === cardIndex
        ) {
          return;
        }

        // First card of pair
        if (room.firstFlippedIndex === null) {
          room.firstFlippedIndex = cardIndex;
          broadcastToRoom(room, {
            type: 'card_revealed',
            cardIndex,
            emoji: room.deck[cardIndex],
            turnIndex: room.turnIndex,
          });
        } else {
          // Second card of pair
          const firstIndex = room.firstFlippedIndex;
          const secondIndex = cardIndex;
          room.firstFlippedIndex = null;

          // Reveal second card immediately
          broadcastToRoom(room, {
            type: 'card_revealed',
            cardIndex: secondIndex,
            emoji: room.deck[secondIndex],
            turnIndex: room.turnIndex,
          });

          const isMatch = room.deck[firstIndex] === room.deck[secondIndex];

          if (isMatch) {
            room.matchedIndices.push(firstIndex, secondIndex);
            activePlayer.score += 100;
            activePlayer.pairs += 1;

            setTimeout(() => {
              const isWin = room.matchedIndices.length >= room.deck.length;

              broadcastToRoom(room, {
                type: 'match_result',
                isMatch: true,
                indices: [firstIndex, secondIndex],
                turnIndex: room.turnIndex,
                players: room.players.map((p) => ({
                  score: p.score,
                  pairs: p.pairs,
                })),
                bonusTurn: !isWin,
              });

              if (isWin) {
                if (room.turnTimer) clearInterval(room.turnTimer);
                room.status = 'ended';

                const p1 = room.players[0];
                const p2 = room.players[1];
                let winnerIndex = -1; // -1 = tie
                if (p1.score > p2.score) winnerIndex = 0;
                else if (p2.score > p1.score) winnerIndex = 1;

                broadcastToRoom(room, {
                  type: 'game_over',
                  winnerIndex,
                  p1: { name: p1.name, avatar: p1.avatar, score: p1.score, pairs: p1.pairs },
                  p2: { name: p2.name, avatar: p2.avatar, score: p2.score, pairs: p2.pairs },
                });
              } else {
                startTurnTimer(room); // Reset turn timer for bonus turn
              }
            }, 300);
          } else {
            // Mismatch
            setTimeout(() => {
              room.turnIndex = room.turnIndex === 0 ? 1 : 0;

              broadcastToRoom(room, {
                type: 'match_result',
                isMatch: false,
                indices: [firstIndex, secondIndex],
                nextTurnIndex: room.turnIndex,
              });

              startTurnTimer(room);
            }, 1000);
          }
        }
      }

      // 4. Quick Live Emotes
      else if (data.type === 'send_emote') {
        if (!currentRoomId) return;
        const room = rooms.get(currentRoomId);
        if (room) {
          const sender = room.players.find((p) => p.id === playerId);
          broadcastToRoom(room, {
            type: 'emote_received',
            emote: data.emote,
            senderName: sender ? sender.name : 'Opponent',
          });
        }
      }

      // 5. Rematch
      else if (data.type === 'rematch') {
        if (!currentRoomId) return;
        const room = rooms.get(currentRoomId);
        if (room && room.players.length === 2) {
          room.deck = createDeck(room.difficulty);
          room.matchedIndices = [];
          room.firstFlippedIndex = null;
          room.turnIndex = 0;
          room.status = 'playing';
          room.players.forEach((p) => {
            p.score = 0;
            p.pairs = 0;
          });

          broadcastToRoom(room, {
            type: 'game_start',
            roomId: room.id,
            difficulty: room.difficulty,
            cardCount: room.deck.length,
            turnIndex: 0,
            players: room.players.map((p, idx) => ({
              id: p.id,
              name: p.name,
              avatar: p.avatar,
              score: p.score,
              pairs: p.pairs,
              index: idx,
            })),
          });

          startTurnTimer(room);
        }
      }
    } catch {
      // Ignore malformed payloads
    }
  });

  ws.on('close', () => {
    if (currentRoomId && rooms.has(currentRoomId)) {
      const room = rooms.get(currentRoomId)!;
      if (room.turnTimer) clearInterval(room.turnTimer);

      // Notify other player that opponent disconnected
      const remainingPlayer = room.players.find((p) => p.id !== playerId);
      if (remainingPlayer) {
        sendToPlayer(remainingPlayer, {
          type: 'opponent_disconnected',
          message: 'Opponent disconnected from the match.',
        });
      }
      rooms.delete(currentRoomId);
    }
  });
});

// Mount Vite or Serve Static Files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Memory Match Full-Stack Server running on port ${PORT}`);
  });
}

startServer();
