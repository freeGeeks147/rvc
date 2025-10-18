const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Compression middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static client files from /public
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Main route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// API routes for support form
app.post('/api/support', (req, res) => {
  const { email } = req.body;
  
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide a valid email address' 
    });
  }
  
  // In a real application, you would save this to a database
  console.log(`New supporter: ${email}`);
  
  res.json({ 
    success: true, 
    message: 'Thank you for supporting Ahmedabad 2030!',
    supporterCount: Math.floor(Math.random() * 1000) + 2500000
  });
});

// API route for visitor statistics
app.get('/api/stats', (req, res) => {
  res.json({
    visitors: Math.floor(Math.random() * 10000) + 50000,
    supporters: Math.floor(Math.random() * 1000) + 2500000,
    countries: 72
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Ahmedabad 2030 CWG Bid Website'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public/index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error' 
  });
});

// Utility function to validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Socket.io for real-time features (support counter updates)
io.on('connection', socket => {
  console.log('New visitor connected:', socket.id);
  
  // Send current stats to new visitor
  socket.emit('stats-update', {
    supporters: Math.floor(Math.random() * 1000) + 2500000,
    visitors: Math.floor(Math.random() * 1000) + 50000
  });
  
  socket.on('disconnect', () => {
    console.log('Visitor disconnected:', socket.id);
  });
});

// Broadcast stats updates every 30 seconds
setInterval(() => {
  const stats = {
    supporters: Math.floor(Math.random() * 1000) + 2500000,
    visitors: Math.floor(Math.random() * 1000) + 50000,
    timestamp: new Date().toISOString()
  };
  
  io.emit('stats-update', stats);
}, 30000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🏆 Ahmedabad 2030 CWG Bid Website running on port ${PORT}`);
  console.log(`🌐 Visit: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
