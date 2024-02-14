export interface IPlayer {
  login: string;
  password: string;
}

export interface ICommand {
  type: string;
  data: object;
}
