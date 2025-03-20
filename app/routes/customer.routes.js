module.exports = app => {
    const customers = require("../controllers/customer.controller.js");
    const customers_v3 = require("../controllers/customer_v3.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Customer
    router.post("/v3", customers_v3.create);
    
  
    // Score a Customer with id
    router.put("/:id", customers.update);
    router.put("/v3/:id", customers_v3.update);
    
    router.post("/fbcapi/", customers.sendEventsToFacebookThroughConversionAPIWithoutScoring);
    router.post("/v3/fbcapi/", customers_v3.sendEventsToFacebookThroughConversionAPIWithoutScoring);
    
  
    app.use('/api/customers', router);
  };
  