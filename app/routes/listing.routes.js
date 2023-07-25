module.exports = app => {
    const listings = require("../controllers/listing.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Listing
    router.post("/", listings.create);
  
    app.use('/api/listings', router);
  };
  