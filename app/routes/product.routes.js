module.exports = app => {
    const products = require("../controllers/product.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Customer
    router.post("/", products.create);
    
    app.use('/api/products', router);
  };
  