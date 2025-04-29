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

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to enhencer!" });
});

require("./app/routes/customer.routes")(app);
require("./app/routes/listing.routes")(app);
require("./app/routes/product.routes")(app);
require("./app/routes/purchase.routes")(app);
require("./app/routes/info.routes")(app);


// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// Global error handler - must be placed after all routes and middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  // Don't attempt to send response if headers already sent or client disconnected
  if (res.headersSent || !req.socket.writable) {
    return next(err);
  }
  
  // Send appropriate error response
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});
