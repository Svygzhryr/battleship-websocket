import { WebSocketServer, WebSocket } from "ws";
import { httpServer } from "../http-server";

import { commands } from "../commands";
import { users } from "../storage";
import { ICommand, ISocketData } from "../types";
import { generatePlayerId } from "../utils";

const startWebsocketServer = () => {
  const port = process.env.PORT || 3000;
  const wss = new WebSocketServer({ server: httpServer });

  wss.on("listening", () => {
    console.log(`Websocket server is now listening. Current options: `);
    const options = JSON.parse(JSON.stringify(httpServer.address()));
    console.log(options);
  });

  wss.on("connection", (ws) => {
    const id = generatePlayerId();

    pingPong(ws);

    ws.on("message", (rawData) => {
      const data: ICommand = JSON.parse(rawData.toString());
      const socketData = { data, ws, wss, id };

      ws.on("close", () => {
        users.splice(
          users.findIndex((user) => user.id === id),
          1
        );
      });

      console.log(data.type);
      try {
        commands[data.type.toUpperCase()](socketData);
      } catch (err) {
        console.error("Unknown command:\n", err);
      }
    });
  });

  httpServer.listen(port);

  httpServer.on("close", () => {
    wss.close();
  });
};

const pingPong = (ws: WebSocket) => {
  if (ws.readyState !== 1) return;
  const heartbeat = setInterval(() => {
    if (ws.readyState === 3) {
      clearInterval(heartbeat);
      console.log("websocket closed");
    }
  }, 5000);
};

export default startWebsocketServer;
