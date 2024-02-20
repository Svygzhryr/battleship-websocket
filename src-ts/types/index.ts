import { WebSocketServer, WebSocket } from 'ws';

export interface IUser {
  name: string;
  password: string;
  id?: string;
  ws: WebSocket;
}

export interface ICommand {
  type: string;
  data: string;
}

export interface ISocketData {
  data: ICommand;
  ws: WebSocket;
  wss: WebSocketServer;
  id: string;
}

export interface ICommandArgs {
  data?: ICommand;
  ws?: WebSocket;
  wss?: WebSocketServer;
}

export interface IWinner {
  name: string;
  wins: number;
}

export interface IRoom {
  roomId: string;
  roomUsers: [
    {
      name: string;
      index: string;
    }
  ];
}

export interface IShip {
  ship: {
    position: {
      x: number;
      y: number;
    };
    direction: boolean;
    type: string;
    length: number;
  };
}

export interface IActiveGamePlayer {
  gameId: string;
  indexPlayer: string;
  ships: IShip[];
}

export interface IActiveGame {
  roomId: string;
  players: IActiveGamePlayer[];
}
