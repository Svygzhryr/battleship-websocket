import { attack, randomAttack, turn, finish } from "./game";
import { reg, update_winners } from "./player";
import { create_game, add_user_to_room, update_room } from "./room";
import { start_game, add_ships } from "./ships";

export const commands: Record<string, () => void> = {
  reg,
  create_game,
  start_game,
  turn,
  attack,
  finish,
  update_room,
  update_winners,
};
