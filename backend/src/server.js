require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const { testConnection, syncDatabase } = require('./config/database');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { initializeSocket } = require('./sockets/socketHandler');
const logger = require('./utils/logger');

// Initialize models and associations
require('./models');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
});

// Initialize socket handlers
initializeSocket(io);

// Make io accessible in routes
app.set('io', io);

// ===== Middleware =====

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev', {
    stream: { write: (message) => logger.info(message.trim()) },
  }));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API placeholder for development (generates colored SVG placeholders)
app.get('/api/placeholder/:width/:height', (req, res) => {
  const { width, height } = req.params;
  const colors = ['#0088FF', '#00D4AA', '#FF6B6B', '#FFB347', '#9B59B6', '#3498DB'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color};stop-opacity:0.8"/>
        <stop offset="100%" style="stop-color:#0A0E27;stop-opacity:0.9"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <text x="50%" y="50%" fill="rgba(255,255,255,0.3)" font-size="16" font-family="Arial" text-anchor="middle" dy=".3em">${width}x${height}</text>
  </svg>`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(svg);
});

// ===== Routes =====
app.use('/api/v1', routes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
  });
}

// Error handling
app.use(errorHandler);

// ===== Start Server =====
const PORT = parseInt(process.env.PORT, 10) || 5000;

const startServer = async () => {
  try {
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      logger.warn('Database not connected. Server starting without database.');
    } else {
      // Sync database in development
      if (process.env.NODE_ENV === 'development') {
        await syncDatabase({ alter: true });
      }
    }

    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║   🦋 Fluttrr API Server                         ║
║                                                  ║
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(33)}║
║   Port:        ${String(PORT).padEnd(33)}║
║   API:         http://localhost:${PORT}/api/v1${' '.repeat(Math.max(0, 13 - String(PORT).length))}║
║   Health:      http://localhost:${PORT}/api/v1/health${' '.repeat(Math.max(0, 6 - String(PORT).length))}║
║   Socket.IO:   Connected${' '.repeat(24)}║
║                                                  ║
╚══════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection:', err);
});

startServer();

module.exports = { app, server, io };
