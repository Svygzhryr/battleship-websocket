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
