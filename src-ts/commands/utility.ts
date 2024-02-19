// for the convenience i moved here functions
// that are only invoked on a server side
import { WebSocket, WebSocketServer } from 'ws';
import { rooms, users, winners } from '../storage';
import { ISocketData } from '../types';
import { findUser, findRoom } from '../utils';

export const updateWinners = (wss: WebSocketServer) => {
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
  wss.clients.forEach((client) => {
    const formResponse = {
      type: 'update_room',
      data: JSON.stringify(rooms),
      id: 0
    };
    client.send(JSON.stringify(formResponse));
  });
};

export const createGame = (socketData: ISocketData, roomId: string) => {
  const { data, ws, wss, id } = socketData;

  const currentRoom = findRoom(roomId);
  const currentRoomPlayers = currentRoom.roomUsers;

  currentRoomPlayers.forEach((player) => {
    const thisPlayersWebSocket = findUser(player.index).ws;
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

export const startGame = () => {};
