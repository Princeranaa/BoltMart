require("dotenv").config();
const app = require("./src/app");
const { initSocketServer } = require("./src/sockets/socket.server");
const http = require("http");

const PORT = process.env.PORT
const httpServer = http.createServer(app);
initSocketServer(httpServer);


httpServer.listen(PORT, () => {
  console.log(`ai buddy service start on the ${PORT} port`);
});
