import { WebSocket, WebSocketServer } from "ws";

import { ICommand, IPlayer, IRoom, ISocketData } from "../types";
import { players, winners, rooms } from "../storage";
import { generatePlayerId, generateRoomId } from "../utils";
import { updateRooms, updateWinners } from "./utility";

const REG = (socketData: ISocketData) => {
  const { data, ws, wss, id } = socketData;
  console.log(">>reg", data);
  const user: IPlayer = JSON.parse(data.data);
  user.id = id;
  players.push(user);

  const responseData = JSON.stringify({
    type: "reg",
    data: JSON.stringify({
      name: user.name,
      index: id,
      error: false,
      errorText: "",
    }),
    id: 0,
  });

  ws.send(responseData);
  updateRooms(wss);
  updateWinners(wss);
};

const ADD_USER_TO_ROOM = (socketData: ISocketData, roomId: string) => {
  const { data, ws, wss, id } = socketData;

  if (!roomId) {
    roomId = JSON.parse(data.data).indexRoom;
    console.log(">>addUserToRoom", data);
  }

  rooms.find((room) => {
    room.roomId === roomId;
    room.roomUsers.push();
  });

  const responseData = JSON.stringify({
    type: "add_user_to_room",
    data: JSON.stringify({
      indexRoom: roomId,
    }),

    id: 0,
  });

  ws.send(responseData);
  updateRooms(wss);
};

const CREATE_ROOM = (socketData: ISocketData) => {
  const { data, ws, wss, id } = socketData;
  console.log(id);
  console.log(">>createRoom", data);

  const foundPlayer = players.find((player) => player.id === id);
  console.log(">> found player", foundPlayer);
  const roomId = generateRoomId();
  const newRoom: IRoom = {
    roomId,
    roomUsers: [
      // get socket id and use here
      {
        name: foundPlayer.name,
        index: foundPlayer.id,
      },
    ],
  };
  rooms.push(newRoom);
  ADD_USER_TO_ROOM(socketData, roomId);
  updateRooms(wss);
};

const ADD_SHIPS = (socketData: ISocketData) => {
  console.log("add ships");
};

const ATTACK = (socketData: ISocketData) => {
  console.log("attack");
};

const RANDOM_ATTACK = (socketData: ISocketData) => {
  console.log("randomAttack");
};

const TURN = (socketData: ISocketData) => {
  console.log("turn");
};

const FINISH = (socketData: ISocketData) => {
  console.log("finish");
};

export const commands: Record<
  string,
  (socketData: ISocketData, roomId?: string) => void
> = {
  REG,
  ADD_USER_TO_ROOM,
  CREATE_ROOM,
  TURN,
  ATTACK,
  FINISH,
};
