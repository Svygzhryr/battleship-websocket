// for the convenience i moved here functions
// that are only invoked on a server side
import { WebSocket, WebSocketServer } from 'ws';

import { currentGames, rooms, users, winners } from '../storage';
import { IActiveGame, IActiveGamePlayer, ISocketData } from '../types';
import { findUser, findRoom, getCurrentGameWebsockets } from '../utils';

let turnCount = 0;

export const updateWinners = (wss: WebSocketServer) => {
  console.log('update_winners');
  const formResponse = JSON.stringify({
    type: 'update_winners',
    data: JSON.stringify(winners),
    id: 0
  });

  wss.clients.forEach((client) => {
    client.send(formResponse);
  });
};

export const updateRooms = (wss: WebSocketServer) => {
  console.log('update_rooms');
  wss.clients.forEach((client) => {
    const formResponse = {
      type: 'update_room',
      data: JSON.stringify(rooms),
      id: 0
    };
    client.send(JSON.stringify(formResponse));
  });
};

export const createGame = (roomId: string) => {
  console.log('create_game');
  const currentRoom = findRoom(roomId);
  const currentRoomPlayers = currentRoom.roomUsers;

  const currentGame = {
    roomId,
    players: [] as IActiveGamePlayer[]
  };

  currentGames.push(currentGame);

  currentRoomPlayers.forEach((player) => {
    const thisPlayersWebSocket = findUser(player.index).ws;
    console.log('>>> USER ID ON CREATE', player.index);
    const formResponse = JSON.stringify({
      type: 'create_game',
      data: JSON.stringify({
        idGame: roomId,
        idPlayer: player.index
      }),
      id: 0
    });

    thisPlayersWebSocket.send(formResponse);
  });
};

export const startGame = (currentGame: IActiveGame) => {
  console.log('start_game');
  let currentGamesWebsockets: WebSocket[] = [];
  currentGame.players.forEach((player) => {
    const { indexPlayer, ships } = player;
    const currentPlayer = findUser(indexPlayer);
    const currentPlayerWebsocket = currentPlayer.ws;
    const formResponse = JSON.stringify({
      type: 'start_game',
      data: JSON.stringify({
        ships: [...ships],
        currentPlayerIndex: indexPlayer
      }),
      id: 0
    });

    currentGamesWebsockets.push(currentPlayerWebsocket);

    currentPlayerWebsocket.send(formResponse);
  });

  currentGame.players.forEach((player) => {
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
  id: string,
  ws: WebSocket
) => {
  const currentGamePlayers = currentGame.players;
  const nextPlayerId = currentGamePlayers.filter(
    (player) => player.indexPlayer !== id
  )[0].indexPlayer;
  currentGame.idOfPlayersTurn = nextPlayerId;
  console.log('turn');
  console.log('>>> WHOSE TURN NOW?', nextPlayerId);
  const formResponse = JSON.stringify({
    type: 'turn',
    data: JSON.stringify({
      currentPlayer: nextPlayerId
    }),
    id: 0
  });
  ws.send(formResponse);
};

export const attackFeedback = (
  currentGame: IActiveGame,
  indexPlayer: string
) => {
  const currentGameWebsockets = getCurrentGameWebsockets(currentGame);
  currentGameWebsockets.forEach((ws) => {
    const formResponse = JSON.stringify({
      type: 'attack',
      data: JSON.stringify({
        position: {
          x: 0,
          y: 0
        },
        currentPlayer: indexPlayer,
        status: 'miss'
      }),
      id: 0
    });

    ws.send(formResponse);
    updateTurn(currentGame, indexPlayer, ws);
  });
};
