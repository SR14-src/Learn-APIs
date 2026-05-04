const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = 8080;

// Serve client.html when browser visits localhost:6000
app.use(express.static(path.join(__dirname)));

// ========================
// Create HTTP server first
// then attach WebSocket to it
// ========================
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ========================
// Track all connected clients
// ========================
const clients = new Map();
let nextId = 1;

// ========================
// Handle connections
// ========================
wss.on('connection', (ws) => {
  // Give each client a unique ID
  const clientId = nextId++;
  clients.set(clientId, ws);

  console.log(`Client ${clientId} connected. Total: ${clients.size}`);

  // Send welcome message to the newly connected client only
  ws.send(JSON.stringify({
    type: 'welcome',
    clientId,
    message: `Welcome! You are Client ${clientId}`,
    totalClients: clients.size,
  }));

  // Notify all OTHER clients that someone joined
  broadcast({
    type: 'user_joined',
    message: `Client ${clientId} joined the chat`,
    totalClients: clients.size,
  }, clientId);

  // ========================
  // Handle incoming messages
  // ========================
  ws.on('message', (raw) => {
    let data;

    try {
      data = JSON.parse(raw);
    } catch (e) {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
      return;
    }

    console.log(`Message from Client ${clientId}:`, data);

    // Handle different message types
    switch (data.type) {

      // Chat message — broadcast to everyone
      case 'chat':
        broadcast({
          type: 'chat',
          from: `Client ${clientId}`,
          message: data.message,
          timestamp: new Date().toISOString(),
        });
        break;

      // Private message — send to one specific client only
      case 'private':
        const target = clients.get(data.targetId);
        if (target && target.readyState === WebSocket.OPEN) {
          target.send(JSON.stringify({
            type: 'private',
            from: `Client ${clientId}`,
            message: data.message,
            timestamp: new Date().toISOString(),
          }));
          // Also confirm to sender
          ws.send(JSON.stringify({
            type: 'private_sent',
            to: `Client ${data.targetId}`,
            message: data.message,
          }));
        } else {
          ws.send(JSON.stringify({
            type: 'error',
            message: `Client ${data.targetId} not found or disconnected`,
          }));
        }
        break;

      // List all connected clients
      case 'list':
        ws.send(JSON.stringify({
          type: 'list',
          clients: Array.from(clients.keys()),
          total: clients.size,
        }));
        break;

      default:
        ws.send(JSON.stringify({
          type: 'error',
          message: `Unknown message type: ${data.type}`,
        }));
    }
  });

  // ========================
  // Handle disconnection
  // ========================
  ws.on('close', () => {
    clients.delete(clientId);
    console.log(`Client ${clientId} disconnected. Total: ${clients.size}`);

    // Notify everyone that this client left
    broadcast({
      type: 'user_left',
      message: `Client ${clientId} left the chat`,
      totalClients: clients.size,
    });
  });

  // Handle errors
  ws.on('error', (err) => {
    console.error(`Client ${clientId} error:`, err.message);
  });
});

// ========================
// Broadcast to all clients
// optionally exclude one client by ID
// ========================
function broadcast(data, excludeId = null) {
  const message = JSON.stringify(data);
  for (const [id, client] of clients) {
    if (id !== excludeId && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

// ========================
// Start the server
// ========================
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`WebSocket running at ws://localhost:${PORT}`);
});