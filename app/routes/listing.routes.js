module.exports = app => {
    const listings = require("../controllers/listing.controller.js");
    const listings_v3 = require("../controllers/listing_v3.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Listing
    router.post("/", listings.create);
    
    router.post("/v3", listings_v3.create);
  
    app.use('/api/listings', router);
  };
  