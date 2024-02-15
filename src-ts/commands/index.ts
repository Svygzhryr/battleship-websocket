import { ICommand } from '../types';
import { ATTACK, RANDOM_ATTACK, TURN, FINISH } from './game';
import { REG, UPDATE_WINNERS } from './player';
import { CREATE_GAME, ADD_USER_TO_ROOM, UPDATE_ROOM } from './room';
import { START_GAME, ADD_SHIPS } from './ships';
import { WebSocket } from 'ws';

export const commands: Record<string, (data: ICommand, ws: WebSocket) => void> =
  {
    REG,
    CREATE_GAME,
    START_GAME,
    TURN,
    ATTACK,
    FINISH,
    UPDATE_ROOM,
    UPDATE_WINNERS
  };
