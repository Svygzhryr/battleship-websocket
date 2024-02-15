import { ICommand } from '../types';
import { WebSocket } from 'ws';

export const START_GAME = (data: ICommand, ws: WebSocket) => {
  console.log('start game');
};

export const ADD_SHIPS = (data: ICommand, ws: WebSocket) => {
  console.log('add ships');
};
