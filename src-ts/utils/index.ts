import WebSocket from 'ws';

import { rooms, uniqueRoomIds, uniqueUserIds, users } from '../storage';
import { IActiveGame, IActiveGamePlayer } from '../types';

const crnd = (min: number, max: number) => {
  return (Math.random() * (max - min) + min).toFixed();
};

export const generateRoomId = () => {
  const prefix = 'abcde'[+crnd(0, 4)];
  const middle = crnd(10, 100);
  const postfix = 'xyz'[+crnd(0, 2)];
  const result = `${prefix}${middle}${postfix}`;

  if (uniqueRoomIds.includes(result)) {
    generateRoomId();
  } else {
    uniqueRoomIds.push(result);
    return result;
  }
};

export const generatePlayerId = () => {
  let result = '';
  while (result.length < 6) {
    const segment = 'mnopq'[+crnd(0, 2)] + crnd(0, 9);
    result += segment;
  }

  if (uniqueUserIds.includes(result)) {
    generatePlayerId();
  } else {
    uniqueUserIds.push(result);
    return result;
  }
};

export const findUser = (id: string) =>
  users.find((player) => player.id === id);

export const findRoom = (roomId: string) =>
  rooms.find((room) => room.roomId === roomId);

export const getCurrentGameWebsockets = (currentGame: IActiveGame) => {
  const currentGameWebsockets: WebSocket[] = [];
  currentGame.players.forEach((player) => {
    const playerWebSocket = findUser(player.indexPlayer).ws;
    currentGameWebsockets.push(playerWebSocket);
  });

  return currentGameWebsockets;
};

export const generatePlayerBoard = (player: IActiveGamePlayer) => {
  player.ships.forEach((ship) => {
    const { board } = player;
    const {
      position: { x, y },
      direction,
      length
    } = ship;

    let i;
    direction ? (i = y) : (i = x);
    const shipEndCoordinate = i + length;
    while (i < shipEndCoordinate) {
      board[direction ? i : y][direction ? x : i] = true;
      i++;
    }
  });
};
