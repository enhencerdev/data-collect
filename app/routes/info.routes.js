module.exports = app => {
    const info = require("../controllers/info.controller.js");
    var router = require("express").Router();
  
    // Create a new Listing
    router.get("/:userId", info.getInfoForCustomer);
  
    app.use('/api/info', router);
  };
  