import { ICommand, IPlayer } from '../types';
import { playerData } from '../player-data';
import { WebSocket } from 'ws';

export const REG = (data: ICommand, ws: WebSocket) => {
  const user: IPlayer = JSON.parse(data.data);
  playerData.push(user);

  const responseData = JSON.stringify({
    type: 'reg',
    data: JSON.stringify({
      name: user.login,
      index: 0,
      error: false,
      errorText: ''
    }),
    id: 0
  });

  ws.send(responseData);
};

export const UPDATE_WINNERS = (data: ICommand, ws: WebSocket) => {
  console.log('updateWinners');
};
