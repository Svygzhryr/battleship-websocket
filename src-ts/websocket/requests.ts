import {
  IActiveGame,
  IActiveGamePlayer,
  IRoom,
  IShip,
  IUser,
  IWinner,
} from "../types";

export const registerResponse = (user: IUser) =>
  JSON.stringify({
    type: "reg",
    data: JSON.stringify({
      name: user.name,
      index: user.id,
      error: false,
      errorText: "",
    }),
    id: 0,
  });

export const winnersResponse = (winners: IWinner[]) =>
  JSON.stringify({
    type: "update_winners",
    data: JSON.stringify(winners),
    id: 0,
  });

export const roomsUpdateResponse = (rooms: IRoom[]) =>
  JSON.stringify({
    type: "update_room",
    data: JSON.stringify(rooms),
    id: 0,
  });

export const createGameResponse = (
  roomId: string,
  player: { name: string; index: string }
) =>
  JSON.stringify({
    type: "create_game",
    data: JSON.stringify({
      idGame: roomId,
      idPlayer: player.index,
    }),
    id: 0,
  });

export const startGameResponse = (ships: IShip[], indexPlayer: string) =>
  JSON.stringify({
    type: "start_game",
    data: JSON.stringify({
      ships: [...ships],
      currentPlayerIndex: indexPlayer,
    }),
    id: 0,
  });

export const updateTurnResponse = (indexPlayer: string) =>
  JSON.stringify({
    type: "turn",
    data: JSON.stringify({
      currentPlayer: indexPlayer,
    }),
    id: 0,
  });

export const attackFeedbackResponse = (
  x: number,
  y: number,
  indexPlayer: string,
  status: string
) =>
  JSON.stringify({
    type: "attack",
    data: JSON.stringify({
      position: {
        x,
        y,
      },
      currentPlayer: indexPlayer,
      status,
    }),
    id: 0,
  });

export const finishResponse = (indexPlayer: string) =>
  JSON.stringify({
    type: "finish",
    data: JSON.stringify({
      winPlayer: indexPlayer,
    }),
    id: 0,
  });
