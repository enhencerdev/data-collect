const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const compression = require('compression');
const methodOverride = require('method-override');
const limiter = require('./app/util/rate-limiter');
const requestLogger = require('./app/util/request-logger');
const jsonValidator = require("./app/middleware/json-validator");
const userIdValidator = require("./app/middleware/user-id-validator");

const app = express();

/* var corsOptions = {
  origin: "http://localhost:8081"
}; */

// Add response time tracking middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // Track slow requests
  const timeoutId = setTimeout(() => {
    console.warn(`SLOW REQUEST WARNING: ${req.method} ${req.originalUrl} - Still processing after 3s`);
  }, 3000);
  
  // Clean up and record timing when response finishes
  res.on('finish', () => {
    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;
    
    // Log very slow requests that still succeeded
    if (duration > 5000) {
      console.warn(`SLOW REQUEST COMPLETED: ${req.method} ${req.originalUrl} - Took ${duration}ms to complete`);
    }
  });
  
  next();
});

// Better CORS configuration with proper error handling
app.use(cors({
  origin: '*', // Allow all origins - customize this for production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

// First, set up parsing with proper error handling
// Use JSON parser for JSON requests
app.use(bodyParser.json({
  limit: '1mb',
  verify: (req, res, buf, encoding) => {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
}));

// Use text parser for text/plain requests
app.use(bodyParser.text({
  type: 'text/plain',
  limit: '1mb'
}));

// Use raw parser as fallback
app.use(bodyParser.raw({
  type: '*/*',
  limit: '1mb'
}));

// Handle request aborted errors - completely ignore/silence them
app.use((err, req, res, next) => {
  // Check for the specific raw-body error messages that indicate actual client aborts
  if (
    (err.code === 'ECONNABORTED' || err.type === 'request.aborted') ||
    (err.message && (
      err.message.includes('request aborted') || 
      err.message.includes('socket hang up') ||
      err.message.includes('client disconnected')
    ))
  ) {
    // Just silently ignore aborted request errors - they're normal and not worth logging
    return;
  }
  next(err);
});

// Then compression and other middleware
app.use(compression());
app.use(methodOverride('X-HTTP-Method-Override'));

// Apply rate limiter after parsing
// app.use(limiter);

// Then your request logger
app.use(requestLogger);

// Apply JSON validator to all API routes
app.use('/api', jsonValidator);

// Apply user ID validator to all API routes
app.use('/api', userIdValidator);

// Add a health check endpoint
app.get('/health', (req, res) => {
  const healthData = {
    status: 'up',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  };
  
  res.status(200).json(healthData);
});

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to enhencer!" });
});

// API routes
console.log("Registering routes...");
require("./app/routes/customer.routes")(app);
require("./app/routes/listing.routes")(app);
require("./app/routes/product.routes")(app);
require("./app/routes/purchase.routes")(app);
require("./app/routes/info.routes")(app);
console.log("Routes registered successfully");

const db = require("./app/models");

db.sequelize.sync()
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

// // drop the table if it already exists
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });

// set port, listen for requests
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// Configure server timeouts
server.timeout = 60000; // 60 seconds socket timeout
server.keepAliveTimeout = 65000; // 65 seconds keep-alive timeout
server.headersTimeout = 66000; // 66 seconds for headers timeout

// Handle uncaught exceptions to prevent server crashes
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  // Don't exit the process - report the error but keep running
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});

// Global error handler - must be placed after all routes and middleware
app.use((err, req, res, next) => {
  // Log detailed error information
  console.error('Unhandled server error:', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    errorName: err.name,
    errorMessage: err.message,
    errorStack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });
  
  // Don't attempt to send response if headers already sent or client disconnected
  if (res.headersSent || !req.socket.writable) {
    return next(err);
  }
  
  // Send appropriate error response
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    // Only include error details in development
    error: process.env.NODE_ENV === 'production' ? undefined : {
      name: err.name,
      message: err.message,
      stack: err.stack
    }
  });
});

// Add a catch-all 404 handler for any unmatched routes
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found'
  });
});

// Handle server-level errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});
