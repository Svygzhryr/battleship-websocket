import { ICommand } from '../types';
import { WebSocket } from 'ws';

export const CREATE_GAME = (data: ICommand, ws: WebSocket) => {
  console.log('createRoom');
};

export const ADD_USER_TO_ROOM = (data: ICommand, ws: WebSocket) => {
  console.log('add user');
};

export const UPDATE_ROOM = (data: ICommand, ws: WebSocket) => {
  console.log('update room');
};
