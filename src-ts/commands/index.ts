import { WebSocket, WebSocketServer } from 'ws';

import { ICommand, IUser, IRoom, ISocketData } from '../types';
import { users, winners, rooms } from '../storage';
import { findRoom, findUser, generatePlayerId, generateRoomId } from '../utils';
import { createGame, updateRooms, updateWinners } from './utility';

const REG = (socketData: ISocketData) => {
  const { data, ws, wss, id } = socketData;
  console.log('>>reg', data);
  const user: IUser = JSON.parse(data.data);
  user.id = id;
  user.ws = ws;
  users.push(user);

  const formResponse = JSON.stringify({
    type: 'reg',
    data: JSON.stringify({
      name: user.name,
      index: id,
      error: false,
      errorText: ''
    }),
    id: 0
  });

  ws.send(formResponse);
  updateRooms(wss);
  updateWinners(wss);
};

const ADD_USER_TO_ROOM = (socketData: ISocketData, roomId: string) => {
  const { data, ws, wss, id } = socketData;

  if (!roomId) {
    roomId = JSON.parse(data.data).indexRoom;
  }

  const currentRoom = findRoom(roomId);
  const currentRoomUsers = currentRoom.roomUsers;
  const { name, id: index } = findUser(id);

  if (!currentRoomUsers.find((user) => user.index === index)) {
    currentRoomUsers.push({ name, index });
  }

  updateRooms(wss);

  if (currentRoomUsers.length > 1) {
    createGame(socketData, roomId);
    const currentRoomIndex = rooms.findIndex((room) => room.roomId === roomId);
    rooms.splice(currentRoomIndex, 1);
  }
};

const CREATE_ROOM = (socketData: ISocketData) => {
  const { data, ws, wss, id } = socketData;

  const foundPlayer = findUser(id);
  const roomId = generateRoomId();
  const newRoom: IRoom = {
    roomId,
    roomUsers: [
      {
        name: foundPlayer.name,
        index: foundPlayer.id
      }
    ]
  };
  rooms.push(newRoom);
  updateRooms(wss);
};

const ADD_SHIPS = (socketData: ISocketData) => {
  const { data, ws, wss, id } = socketData;
  console.log(data);
};

const ATTACK = (socketData: ISocketData) => {
  console.log('attack');
};

const RANDOM_ATTACK = (socketData: ISocketData) => {
  console.log('randomAttack');
};

const TURN = (socketData: ISocketData) => {
  console.log('turn');
};

const FINISH = (socketData: ISocketData) => {
  console.log('finish');
};

export const commands: Record<
  string,
  (socketData: ISocketData, roomId?: string) => void
> = {
  ADD_SHIPS,
  ADD_USER_TO_ROOM,
  ATTACK,
  CREATE_ROOM,
  FINISH,
  REG,
  TURN
};
