import { WebSocket, WebSocketServer } from "ws";
import { httpServer } from "../http-server";
import { ICommand } from "../types";
import { commands } from "../commands";

const port = process.env.PORT || 3000;
const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", (ws) => {
  ws.on("message", (rawData) => {
    console.log(wss.clients.size);
    const command = JSON.parse(rawData.toString());
    commands[command.type]();
  });
});

httpServer.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

export default wss;
