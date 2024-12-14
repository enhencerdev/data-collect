const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const compression = require('compression');
const methodOverride = require('method-override');
const limiter = require('./app/util/rate-limiter');

const requestIp = require('request-ip');

const app = express();

/* var corsOptions = {
  origin: "http://localhost:8081"
}; */


// Add this to your Express app configuration
const requestLogger = (req, res, next) => {
  const clientIp = requestIp.getClientIp(req);
  const timestamp = new Date().toISOString();
  
  console.log({
    timestamp,
    ip: clientIp,
    method: req.method,
    path: req.path,
    userID: req.body?.userID || req.params?.id,
    userAgent: req.headers['user-agent']
  });
  
  next();
};

app.use(methodOverride('X-HTTP-Method-Override'))
app.use(cors());

app.use(requestLogger);
app.use(limiter);

// parse requests of content-type - application/json
// app.use(express.json());
app.use(bodyParser.text({ type: 'text/plain' }))
app.use(compression())

// parse requests of content-type - application/x-www-form-urlencoded
// app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const start = Date.now();  // Record start time
  res.on('finish', () => {   // When the response is finished
      const duration = Date.now() - start;  // Calculate duration
      console.log(`Request URL: ${req.originalUrl} - Response Time: ${duration}ms`);
  });
  next();
});


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



// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
