module.exports = app => {
    const purchases = require("../controllers/purchase.controller.js");
  
    var router = require("express").Router();
  
    // Create a new purchase
    router.post("/", purchases.create);
    
    app.use('/api/purchases', router);
  };
  