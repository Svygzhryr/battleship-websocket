// for the convenience i moved here functions
// that are only invoked on a server side
import { WebSocket, WebSocketServer } from 'ws';

import { currentGames, rooms, users, winners } from '../storage';
import { IActiveGame, IActiveGamePlayer, ISocketData } from '../types';
import {
  findUser,
  findRoom,
  getCurrentGameWebsockets,
  generatePlayerBoard,
  findEnemy
} from '../utils';

export const updateWinners = (wss: WebSocketServer) => {
  console.log('update_winners');
  const formResponse = JSON.stringify({
    type: 'update_winners',
    data: JSON.stringify(winners),
    id: 0
  });

  wss.clients.forEach((client) => {
    client.send(formResponse);
  });
};

export const updateRooms = (wss: WebSocketServer) => {
  console.log('update_rooms');
  wss.clients.forEach((client) => {
    const formResponse = {
      type: 'update_room',
      data: JSON.stringify(rooms),
      id: 0
    };
    client.send(JSON.stringify(formResponse));
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
    const formResponse = JSON.stringify({
      type: 'create_game',
      data: JSON.stringify({
        idGame: roomId,
        idPlayer: player.index
      }),
      id: 0
    });

    thisPlayersWebSocket.send(formResponse);
  });
};

export const startGame = (currentGame: IActiveGame) => {
  console.log('start_game');
  let currentGamesWebsockets: WebSocket[] = [];
  currentGame.players.forEach((player) => {
    const { indexPlayer, ships } = player;
    const currentPlayer = findUser(indexPlayer);
    const currentPlayerWebsocket = currentPlayer.ws;
    const formResponse = JSON.stringify({
      type: 'start_game',
      data: JSON.stringify({
        ships: [...ships],
        currentPlayerIndex: indexPlayer
      }),
      id: 0
    });

    currentGamesWebsockets.push(currentPlayerWebsocket);

    currentPlayerWebsocket.send(formResponse);
  });

  currentGame.players.forEach((player) => {
    player.board = JSON.parse(
      JSON.stringify(Array(10).fill(Array(10).fill(false)))
    );
    player.hitBoard = JSON.parse(
      JSON.stringify(Array(10).fill(Array(10).fill(false)))
    );

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
  const formResponse = JSON.stringify({
    type: 'turn',
    data: JSON.stringify({
      currentPlayer: indexPlayer
    }),
    id: 0
  });
  ws.send(formResponse);
};

export const attackFeedback = (
  currentGame: IActiveGame,
  indexPlayer: string,
  board: boolean[][],
  hitBoard: boolean[][],
  x: number,
  y: number
) => {
  const currentGameWebsockets = getCurrentGameWebsockets(currentGame);
  const { ships } = currentGame.players.find(
    (player) => player.indexPlayer === indexPlayer
  );

  let status = 'miss';
  let isLanded = false;
  // если попали по кораблю - ищем в массиве кораблей совпадаюбщие координаты
  // если есть корабль - определяем его тип и проверяем смежные координаты от начальной и дальше по алгоритму
  if (board[y][x]) {
    status = 'shot';
    isLanded = true;

    console.log(ships);

    ships.forEach((ship) => {
      const {
        length,
        direction,
        position: { x: x1, y: y1 }
      } = ship;

      const thisShipTakenShots = [];
      const shotsToKill = length;

      let i;
      direction ? (i = y1) : (i = x1);
      const shipEndCoordinate = i + length;
      while (i < shipEndCoordinate) {
        if (hitBoard[direction ? i : y1][direction ? x1 : i] === true) {
          thisShipTakenShots.push({ x1, y1 });
        }
        i++;
      }

      if (thisShipTakenShots.length === shotsToKill) {
        thisShipTakenShots.forEach((shot) => {
          const { x1, y1 } = shot;

          currentGameWebsockets.forEach((ws) => {
            const formResponse = JSON.stringify({
              type: 'attack',
              data: JSON.stringify({
                position: {
                  x: x1,
                  y: y1
                },
                currentPlayer: indexPlayer,
                status
              }),
              id: 0
            });

            ws.send(formResponse);
          });
        });
      }
    });
  }

  currentGameWebsockets.forEach((ws) => {
    const formResponse = JSON.stringify({
      type: 'attack',
      data: JSON.stringify({
        position: {
          x,
          y
        },
        currentPlayer: indexPlayer,
        status
      }),
      id: 0
    });

    ws.send(formResponse);
    // не менять ход если игрок попал в корабль
    updateTurn(currentGame, indexPlayer, ws, isLanded);
  });
};
