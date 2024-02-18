// for the convenience i moved here functions
// that are only invoked on a server side
import ws from "ws";

import { WebSocket, WebSocketServer } from "ws";
import { rooms, winners } from "../storage";

export const updateWinners = (wss: WebSocketServer) => {
  const responseData = JSON.stringify({
    type: "update_winners",
    data: JSON.stringify(winners),
    id: 0,
  });

  wss.clients.forEach((client) => {
    client.send(responseData);
  });
};

export const updateRooms = (wss: WebSocketServer) => {
  wss.clients.forEach((client) => {
    const responseData = {
      type: "update_room",
      data: JSON.stringify(rooms),
      id: 0,
    };
    client.send(JSON.stringify(responseData));
  });
  console.log(">> all rooms", rooms, JSON.parse(rooms.data));
};

export const createGame = () => {};

export const startGame = () => {};
