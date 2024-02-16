import { WebSocket, WebSocketServer } from 'ws';

import { ICommand, IPlayer, IRoom, ISocketData } from '../types';
import { players, winners, rooms } from '../storage';
import { generatePlayerId, generateRoomId } from '../utils';
import { updateRooms, updateWinners } from './utility';

const REG = (socketData: ISocketData) => {
  const { data, ws, wss, id } = socketData;
  console.log('>>reg', data);
  const user: IPlayer = JSON.parse(data.data);
  user.id = id;
  players.push(user);

  const responseData = JSON.stringify({
    type: 'reg',
    data: JSON.stringify({
      name: user.name,
      index: id,
      error: false,
      errorText: ''
    }),
    id: 0
  });

  ws.send(responseData);
  console.log(players);

  updateRooms(wss);
  updateWinners(wss);
};

const CREATE_ROOM = (socketData: ISocketData) => {
  const { data, ws, wss, id } = socketData;
  console.log('>>createRoom', data);

  const roomId = generateRoomId();
  const newRoom: IRoom = {
    roomId,
    roomUsers: [
      // get socket id and use here
      {
        name: lastPlayer.name,
        index: lastPlayer.id
      }
    ]
  };
  rooms.push(newRoom);
  updateRooms(wss);
};

const ADD_USER_TO_ROOM = (socketData: ISocketData) => {
  const { data, ws, wss, id } = socketData;

  const roomId = JSON.parse(data.data).indexRoom;
  console.log('>>addUserToRoom', data);

  // rooms.find((room) => {
  //   room.roomId === roomId;
  //   room.roomUsers.push();
  // });

  // ws.send(responseData);
  updateRooms(wss);
};

const ADD_SHIPS = (socketData: ISocketData) => {
  console.log('add ships');
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

export const commands: Record<string, (socketData: ISocketData) => void> = {
  REG,
  ADD_USER_TO_ROOM,
  CREATE_ROOM,
  TURN,
  ATTACK,
  FINISH
};
