// server.js (Node.js with WebSocket)
const WebSocket = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WebSocket server running');
});

const wss = new WebSocket.Server({ server });

const users = new Map();

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        try {
            const parsedMessage = JSON.parse(message);
            switch (parsedMessage.type) {
                case 'join':
                    users.set(ws, parsedMessage.username);
                    broadcastUsers();
                    break;
                case 'message':
                    broadcastMessage(parsedMessage.username, parsedMessage.text);
                    break;
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        users.delete(ws);
        broadcastUsers();
    });
});

function broadcastMessage(username, text) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'message', username, text }));
        }
    });
}

function broadcastUsers() {
    const userList = Array.from(users.values());
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'users', users: userList }));
        }
    });
}

const port = process.env.PORT || 8080;
server.listen(port, () => {
    console.log(`WebSocket server listening on port ${port}`);
});
              
