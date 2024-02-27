import { IActiveGame, IRoom } from "../types";
import { IWinner } from "../types";
import { IUser } from "../types";

export const uniqueUserIds: string[] = [];
export const uniqueRoomIds: string[] = [];

export const users: IUser[] = [];
export const rooms: IRoom[] = [];
export const winners: IWinner[] = [];
export const currentGames: IActiveGame[] = [];
