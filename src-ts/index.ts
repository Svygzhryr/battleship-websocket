import wss from "./websocket/websocket-server";

const appStart = () => {
  console.log(`Current websocket server options: \n`, wss.options);
};

appStart();
