import { ICommand } from '../types';
import { WebSocket } from 'ws';

export const ATTACK = (data: ICommand, ws: WebSocket) => {
  console.log('attack');
};

export const RANDOM_ATTACK = (data: ICommand, ws: WebSocket) => {
  console.log('randomAttack');
};

export const TURN = (data: ICommand, ws: WebSocket) => {
  console.log('turn');
};

export const FINISH = (data: ICommand, ws: WebSocket) => {
  console.log('finish');
};
