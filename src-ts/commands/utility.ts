import { WebSocket, WebSocketServer } from "ws";

import { currentGames, rooms, users, winners } from "../storage";
import { IActiveGame, IActiveGamePlayer, ISocketData } from "../types";
import {
  findUser,
  findRoom,
  getCurrentGameWebsockets,
  generatePlayerBoard,
  findEnemy,
} from "../utils";
import {
  attackFeedbackResponse,
  createGameResponse,
  finishResponse,
  roomsUpdateResponse,
  startGameResponse,
  updateTurnResponse,
  winnersResponse,
} from "../websocket/requests";

export const updateWinners = (wss: WebSocketServer) => {
  console.log("update_winners");
  wss.clients.forEach((client) => {
    client.send(winnersResponse(winners));
  });
};

export const updateRooms = (wss: WebSocketServer) => {
  console.log("update_rooms");
  wss.clients.forEach((client) => {
    client.send(roomsUpdateResponse(rooms));
  });
};

export const createGame = (roomId: string) => {
  console.log("create_game");
  const currentRoom = findRoom(roomId);
  const currentRoomPlayers = currentRoom.roomUsers;

  const currentGame = {
    roomId,
    players: [] as IActiveGamePlayer[],
  };

  currentGames.push(currentGame);

  currentRoomPlayers.forEach((player) => {
    const thisPlayersWebSocket = findUser(player.index).ws;
    console.log(">>> USER ID ON CREATE", player.index);
    thisPlayersWebSocket.send(createGameResponse(roomId, player));
  });
};

export const startGame = (currentGame: IActiveGame) => {
  console.log("start_game");
  let currentGamesWebsockets: WebSocket[] = [];
  currentGame.players.forEach((player) => {
    const { indexPlayer, ships } = player;
    const currentPlayer = findUser(indexPlayer);
    const currentPlayerWebsocket = currentPlayer.ws;
    currentGamesWebsockets.push(currentPlayerWebsocket);

    currentPlayerWebsocket.send(startGameResponse(ships, indexPlayer));
  });

  currentGame.players.forEach((player) => {
    player.board = JSON.parse(
      JSON.stringify(Array(10).fill(Array(10).fill(false)))
    );
    player.hitBoard = JSON.parse(
      JSON.stringify(Array(10).fill(Array(10).fill(false)))
    );

    generatePlayerBoard(player);

    const currentPlayer = findUser(player.indexPlayer);
    const currentPlayerWebsocket = currentPlayer.ws;
    updateTurn(
      currentGame,
      currentGame.players[1].indexPlayer,
      currentPlayerWebsocket
    );
  });
};

export const updateTurn = (
  currentGame: IActiveGame,
  indexPlayer: string,
  ws: WebSocket,
  isLanded = false
) => {
  if (!isLanded) {
    const nextPlayer = findEnemy(currentGame, indexPlayer);
    ({ indexPlayer } = nextPlayer);
  }
  console.log("turn");
  console.log(">>> WHOSE TURN NOW?", indexPlayer);
  currentGame.idOfPlayersTurn = indexPlayer;
  ws.send(updateTurnResponse(indexPlayer));
};

export const attackFeedback = (
  currentGame: IActiveGame,
  indexPlayer: string,
  board: boolean[][],
  hitBoard: boolean[][],
  x: number,
  y: number,
  wss: WebSocketServer
) => {
  let isKilled = false;
  let wreckedShips = 0;
  const currentGameWebsockets = getCurrentGameWebsockets(currentGame);
  const { ships } = findEnemy(currentGame, indexPlayer);

  let status = "miss";
  let isLanded = false;
  if (board[y][x]) {
    status = "shot";
    isLanded = true;

    ships.forEach((ship) => {
      const {
        length,
        direction,
        position: { x: x1, y: y1 },
      } = ship;

      const thisShipTakenShots: { x1: number; y1: number }[] = [];
      const shotsToKill = length;

      let i;
      direction ? (i = y1) : (i = x1);
      const shipEndCoordinate = i + length;

      while (i < shipEndCoordinate) {
        if (length === 4) {
          console.log(hitBoard[direction ? i : y1][direction ? x1 : i]);
        }
        if (hitBoard[direction ? i : y1][direction ? x1 : i]) {
          thisShipTakenShots.push({
            x1: direction ? x1 : i,
            y1: direction ? i : y1,
          });
        }
        i++;
      }

      console.log(thisShipTakenShots);
      if (thisShipTakenShots.length === shotsToKill) {
        isKilled = true;
        // корабли уничтожаются каждый раз))
        // надо дать полю понять что разносить надо только те корабли, которые мы уничтожили с последним кликом
        currentGameWebsockets.forEach((ws) => {
          thisShipTakenShots.forEach((cell) => {
            const { x1, y1 } = cell;
            ws.send(attackFeedbackResponse(x1, y1, indexPlayer, "killed"));
          });

          wreckedShips++;
          if (wreckedShips === 10) {
            currentGameWebsockets.forEach((ws) => {
              ws.send(finishResponse(indexPlayer));
            });
            updateWinners(wss);
            return;
          }

          updateTurn(currentGame, indexPlayer, ws, isLanded);
        });
      }
    });
  }

  if (!isKilled) {
    currentGameWebsockets.forEach((ws) => {
      ws.send(attackFeedbackResponse(x, y, indexPlayer, status));
      updateTurn(currentGame, indexPlayer, ws, isLanded);
    });
  }
};

export const finishGame = (wss: WebSocketServer) => {};
