import { WebSocket, WebSocketServer } from 'ws';
import { httpServer } from '../http-server';
import { ICommand } from '../types';
import { commands } from '../commands';

const startWebsocketServer = () => {
  const port = process.env.PORT || 3000;
  const wss = new WebSocketServer({ server: httpServer });

  wss.on('listening', () => {
    console.log(`Websocket is now listening. Current options: `);
    const options = JSON.parse(JSON.stringify(httpServer.address()));
    console.log(options);
  });

  wss.on('connection', (ws) => {
    ws.on('message', (rawData) => {
      console.log(wss.clients.size);
      const command = JSON.parse(rawData.toString());
      try {
        commands[command.type.toUpperCase()](command, ws);
      } catch (err) {
        console.error('Unknown command');
      }
    });
  });

  wss.on('close', () => {
    console.log('Websocket server is now closed.');
  });

  httpServer.listen(port);
};

export default startWebsocketServer;
