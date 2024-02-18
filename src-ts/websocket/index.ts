import { WebSocketServer } from "ws";
import { httpServer } from "../http-server";

import { commands } from "../commands";
import { players } from "../storage";
import { ICommand, ISocketData } from "../types";
import { generatePlayerId } from "../utils";

const startWebsocketServer = () => {
  const port = process.env.PORT || 3000;
  const wss = new WebSocketServer({ server: httpServer });

  wss.on("listening", () => {
    console.log(`Websocket is now listening. Current options: `);
    const options = JSON.parse(JSON.stringify(httpServer.address()));
    console.log(options);
  });

  wss.on("connection", (ws) => {
    const id = generatePlayerId();

    ws.on("message", (rawData) => {
      const data: ICommand = JSON.parse(rawData.toString());
      const socketData = { data, ws, wss, id };

      console.log(data.type);
      try {
        commands[data.type.toUpperCase()](socketData);
      } catch (err) {
        console.error("Unknown command:\n", err);
      }
    });
  });

  wss.on("close", () => {
    console.log("Websocket server is now closed.");
  });

  wss.clients.forEach((client) => {
    client.on("close", () => {
      console.log(client.url, "closed");
      // playerData.splice(??, ??)
    });
  });

  httpServer.listen(port);

  httpServer.on("close", () => {
    wss.close();
  });
};

export default startWebsocketServer;
