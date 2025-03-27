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

wss.on('connection', (ws) => {
    console.log('Client connected.');

    ws.on('message', (message) => {
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected.');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
