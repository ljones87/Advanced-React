require('dotenv').config({path: 'variables.env' });
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

//user express middleware to handle cookies & populate current user

server.start({
  cors: {
    credentials: true,
    origin: process.env.FRONTEND_URL
  }
}, deets => {
  console.log(`server now running on http://localhost:${deets.port}`);
});
