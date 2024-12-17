module.exports = app => {
  const products = require("../controllers/product.controller.js");
  const products_v3 = require("../controllers/product_v3.controller.js");

  var router = require("express").Router();

  // Create a new Customer
  router.post("/", products.create);
  
  router.post("/v3", products_v3.create);

  app.use('/api/products', router);
};
