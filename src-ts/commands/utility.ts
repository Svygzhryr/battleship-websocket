import { WebSocket, WebSocketServer } from 'ws';

import { currentGames, rooms, users, winners } from '../storage';
import { IActiveGame, IActiveGamePlayer, ISocketData } from '../types';
import {
  findUser,
  findRoom,
  getCurrentGameWebsockets,
  generatePlayerBoard,
  findEnemy,
  attackAllNearbyCells
} from '../utils';
import {
  attackFeedbackResponse,
  createGameResponse,
  finishResponse,
  roomsUpdateResponse,
  startGameResponse,
  updateTurnResponse,
  winnersResponse
} from '../websocket/requests';

export const updateWinners = (wss: WebSocketServer) => {
  console.log('update_winners');
  wss.clients.forEach((client) => {
    client.send(winnersResponse(winners));
  });
};

export const updateRooms = (wss: WebSocketServer) => {
  console.log('update_rooms');
  wss.clients.forEach((client) => {
    client.send(roomsUpdateResponse(rooms));
  });
};

export const createGame = (roomId: string) => {
  console.log('create_game');
  const currentRoom = findRoom(roomId);
  const currentRoomPlayers = currentRoom.roomUsers;

  const currentGame = {
    roomId,
    players: [] as IActiveGamePlayer[]
  };

  currentGames.push(currentGame);

  currentRoomPlayers.forEach((player) => {
    const thisPlayersWebSocket = findUser(player.index).ws;
    console.log('>>> USER ID ON CREATE', player.index);
    thisPlayersWebSocket.send(createGameResponse(roomId, player));
  });
};

export const startGame = (currentGame: IActiveGame) => {
  console.log('start_game');
  let currentGamesWebsockets: WebSocket[] = [];
  currentGame.players.forEach((player) => {
    const { indexPlayer, ships } = player;
    const currentPlayer = findUser(indexPlayer);
    const currentPlayerWebsocket = currentPlayer.ws;
    currentGamesWebsockets.push(currentPlayerWebsocket);

    currentPlayerWebsocket.send(startGameResponse(ships, indexPlayer));
  });

  currentGame.players.forEach((player) => {
    player.board = JSON.parse(
      JSON.stringify(Array(10).fill(Array(10).fill(false)))
    );
    player.hitBoard = JSON.parse(
      JSON.stringify(Array(10).fill(Array(10).fill(false)))
    );
    player.shipsWrecked = 0;

    generatePlayerBoard(player);

    const currentPlayer = findUser(player.indexPlayer);
    const currentPlayerWebsocket = currentPlayer.ws;
    updateTurn(
      currentGame,
      currentGame.players[1].indexPlayer,
      currentPlayerWebsocket
    );
  });
};

export const updateTurn = (
  currentGame: IActiveGame,
  indexPlayer: string,
  ws: WebSocket,
  isLanded = false
) => {
  if (!isLanded) {
    const nextPlayer = findEnemy(currentGame, indexPlayer);
    ({ indexPlayer } = nextPlayer);
  }
  console.log('turn');
  console.log('>>> WHOSE TURN NOW?', indexPlayer);
  currentGame.idOfPlayersTurn = indexPlayer;
  ws.send(updateTurnResponse(indexPlayer));
};

export const attackFeedback = (
  currentGame: IActiveGame,
  indexPlayer: string,
  board: boolean[][],
  hitBoard: boolean[][],
  x: number,
  y: number,
  wss: WebSocketServer
) => {
  const currentGameWebsockets = getCurrentGameWebsockets(currentGame);
  const enemyPlayer = findEnemy(currentGame, indexPlayer);
  const { ships } = enemyPlayer;

  let status = 'miss';
  let isLanded = false;
  if (board[y][x]) {
    status = 'shot';
    isLanded = true;

    currentGameWebsockets.forEach((ws) => {
      ws.send(attackFeedbackResponse(x, y, indexPlayer, status));
      updateTurn(currentGame, indexPlayer, ws, isLanded);
    });

    ships.forEach((ship) => {
      const {
        length,
        direction,
        position: { x: x1, y: y1 }
      } = ship;
      if (ship.isWrecked) return;

      const thisShipTakenShots: { x1: number; y1: number }[] = [];
      const shotsToKill = length;

      let i;
      direction ? (i = y1) : (i = x1);
      const shipEndCoordinate = i + length;

      while (i < shipEndCoordinate) {
        if (hitBoard[direction ? i : y1][direction ? x1 : i]) {
          thisShipTakenShots.push({
            x1: direction ? x1 : i,
            y1: direction ? i : y1
          });
        }
        i++;
      }

      if (thisShipTakenShots.length === shotsToKill) {
        ship.isWrecked = true;
        enemyPlayer.shipsWrecked++;

        if (enemyPlayer.shipsWrecked === 10) {
          finishGame(wss, currentGameWebsockets, currentGame, indexPlayer);
        }

        currentGameWebsockets.forEach((ws) => {
          thisShipTakenShots.forEach((cell) => {
            const { x1, y1 } = cell;
            ws.send(attackFeedbackResponse(x1, y1, indexPlayer, 'killed'));
            attackAllNearbyCells(x1, y1, ws, indexPlayer, board);
          });
          updateTurn(currentGame, indexPlayer, ws, isLanded);
        });
      }
    });
  } else {
    currentGameWebsockets.forEach((ws) => {
      ws.send(attackFeedbackResponse(x, y, indexPlayer, status));
      updateTurn(currentGame, indexPlayer, ws, isLanded);
    });
  }
};

export const finishGame = (
  wss: WebSocketServer,
  currentGameWebsockets: WebSocket[],
  currentGame: IActiveGame,
  indexPlayer: string
) => {
  const winner = findUser(indexPlayer);
  const id = currentGame.roomId;
  currentGames.splice(
    currentGames.findIndex((game) => game.roomId === id),
    1
  );
  rooms.splice(
    rooms.findIndex((room) => room.roomId === id),
    1
  );

  const foundWinner = winners.find((user) => user.name === winner.name);

  if (foundWinner) {
    foundWinner.wins++;
  } else {
    winners.push({ name: winner.name, wins: 1 });
  }

  currentGameWebsockets.forEach((ws) => {
    ws.send(finishResponse(indexPlayer));
  });
  updateWinners(wss);
  updateRooms(wss);
};
