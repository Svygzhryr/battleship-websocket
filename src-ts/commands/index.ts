import { WebSocket, WebSocketServer } from "ws";

import {
  ICommand,
  IUser,
  IRoom,
  ISocketData,
  IActiveGamePlayer,
  IAttack,
} from "../types";
import { users, winners, rooms, currentGames } from "../storage";
import {
  crnd,
  findCellToAttack,
  findEnemy,
  findRoom,
  findUser,
  generatePlayerId,
  generateRoomId,
} from "../utils";
import {
  attackFeedback,
  createGame,
  startGame,
  updateRooms,
  updateTurn,
  updateWinners,
} from "./utility";
import { registerResponse } from "../websocket/requests";

const REG = (socketData: ISocketData) => {
  const { data, ws, wss, id } = socketData;
  console.log(">>reg", data);
  const user: IUser = JSON.parse(data.data);
  user.ws = ws;

  const doesUserExist = users.find((item) => item.name === user.name);

  if (!doesUserExist) {
    ws.send(registerResponse(user));
    updateRooms(wss);
    updateWinners(wss);
    users.push(user);
  } else {
    console.error("User with this username already exists!");
  }
};

const ADD_USER_TO_ROOM = (socketData: ISocketData, roomId: string) => {
  const { data, wss, id } = socketData;

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
    createGame(roomId);
    const currentRoomIndex = rooms.findIndex((room) => room.roomId === roomId);
    rooms.splice(currentRoomIndex, 1);
  }
};

const CREATE_ROOM = (socketData: ISocketData) => {
  const { wss, id } = socketData;

  const foundPlayer = findUser(id);
  const roomId = generateRoomId();
  const newRoom: IRoom = {
    roomId,
    roomUsers: [
      {
        name: foundPlayer.name,
        index: foundPlayer.id,
      },
    ],
  };
  rooms.push(newRoom);
  updateRooms(wss);
};

const ADD_SHIPS = (socketData: ISocketData) => {
  const { data } = socketData;
  const playerData = JSON.parse(data.data) as IActiveGamePlayer;
  const { gameId } = playerData;
  console.log(">>> THIS PLAYER ADDED SHIPS", playerData.indexPlayer);

  const currentGame = currentGames.find((game) => game.roomId === gameId);
  currentGame.players.push(playerData);

  if (currentGame.players.length > 1) {
    startGame(currentGame);
  }
};

const ATTACK = (socketData: ISocketData) => {
  const { data, wss } = socketData;
  const { indexPlayer, gameId, x, y } = JSON.parse(data.data) as IAttack;
  const currentGame = currentGames.find((game) => game.roomId === gameId);
  const { board, hitBoard } = findEnemy(currentGame, indexPlayer);

  if (currentGame.idOfPlayersTurn === indexPlayer && !hitBoard[y][x]) {
    hitBoard[y][x] = true;
    attackFeedback(currentGame, indexPlayer, board, hitBoard, x, y, wss);
  }
};

const RANDOMATTACK = (socketData: ISocketData) => {
  const { data, wss } = socketData;
  const { indexPlayer, gameId } = JSON.parse(data.data) as IAttack;
  const currentGame = currentGames.find((game) => game.roomId === gameId);
  const { board, hitBoard } = findEnemy(currentGame, indexPlayer);

  const { x, y } = findCellToAttack(hitBoard);

  if (currentGame.idOfPlayersTurn === indexPlayer && !hitBoard[y][x]) {
    hitBoard[y][x] = true;
    attackFeedback(currentGame, indexPlayer, board, hitBoard, x, y, wss);
  }
};

export const commands: Record<
  string,
  (socketData: ISocketData, roomId?: string) => void
> = {
  ADD_SHIPS,
  ADD_USER_TO_ROOM,
  ATTACK,
  CREATE_ROOM,
  REG,
  RANDOMATTACK,
};
