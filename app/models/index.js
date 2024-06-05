const Mongoose = require('mongoose');

const dbConfig = require("../config/db.config.js");
const mongodbConfig = require("../config/mongo.config.js");

const ENV = process.env.NODE_ENV || 'development';

const dbOptions = {
  keepAlive: 1,
  socketTimeoutMS: 8000000,
  connectTimeoutMS: 8000000,
  // useCreateIndex: true,
  useNewUrlParser: true
};

const mongoose = new Mongoose.createConnection(mongodbConfig[ENV], dbOptions);

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function () {
  Mongoose.connection.close(function () {
    console.log('Mongoose disconnected on app termination');
    process.exit(0);
  });
});


const Sequelize = require("sequelize");
/* const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
}); */
const sequelize = new Sequelize(dbConfig[ENV]);
console.log("========= sequelize " , dbConfig)


const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.customers = require("./sql/customer.model.js")(sequelize, Sequelize);
db.listings = require("./sql/listing.model.js")(sequelize, Sequelize);
db.products = require("./sql/product.model.js")(sequelize, Sequelize);
db.purchases = require("./sql/purchase.model.js")(sequelize, Sequelize);
db.visitors = require("./sql/visitor.model.js")(sequelize, Sequelize);
db.tatilBudurListings = require("./sql/tatilBudur.listing.model.js")(sequelize, Sequelize);
db.tatilBudurProducts = require("./sql/tatilBudur.product.model.js")(sequelize, Sequelize);
db.tatilBudurPurchases = require("./sql/tatilBudur.purchase.model.js")(sequelize, Sequelize);
db.jollyListings = require("./sql/jolly.listing.model.js")(sequelize, Sequelize);
db.jollyProducts = require("./sql/jolly.product.model.js")(sequelize, Sequelize);
db.jollyPurchases = require("./sql/jolly.purchase.model.js")(sequelize, Sequelize);
db.mngListings = require("./sql/mng.listing.model.js")(sequelize, Sequelize);
db.mngProducts = require("./sql/mng.product.model.js")(sequelize, Sequelize);
db.mngPurchases = require("./sql/mng.purchase.model.js")(sequelize, Sequelize);

db.mongoose = mongoose;
db.Mongoose = Mongoose;

db.userModel = mongoose.model(
  "user",
  require("./nosql/purchaseUser.model"),
  "purchase_users"
)
db.projectModel = mongoose.model(
  "project",
  require("./nosql/purchaseProject.model"),
  "projects"
)

db.modelModel = mongoose.model('model', require("./nosql/purchaseModel.model"), 'models');
db.facebookLogModel = mongoose.model('facebook_log', require("./nosql/facebookLog.model"));

module.exports = db;
