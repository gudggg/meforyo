// server.js (Node.js with WebSocket)
const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading index.html');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else {
      fs.readFile(path.join(__dirname, req.url), (err, data) => {
          if (err) {
              res.writeHead(404);
              res.end('File not found');
          } else {
              res.writeHead(200);
              res.end(data);
          }
      });
    }

});

const wss = new WebSocket.Server({ server });

const users = {};

wss.on('connection', (ws) => {
    console.log('Client connected.');

    ws.on('message', (message) => {
        const data = JSON.parse(message.toString());
        if (data.type === 'join') {
            users[ws] = data.username;
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN){
                client.send(JSON.stringify({ type: 'userJoined', username: data.username }));
              }
            });

        } else if (data.type === 'message') {
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'message', username: users[ws], message: data.message }));
                }
            });
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected.');
        const username = users[ws];
        delete users[ws];
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN){
            client.send(JSON.stringify({type: 'userLeft', username: username}));
          }
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
