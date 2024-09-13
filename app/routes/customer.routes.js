module.exports = app => {
    const customers = require("../controllers/customer.controller.js");
    const customers_v3 = require("../controllers/customer_v3.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Customer
    router.post("/", customers.create);
  
    //Update a Customer with id
    router.put("/:id", customers.update);
    
    router.post("/fbcapi/", customers.sendEventsToFacebookThroughConversionAPIWithoutScoring);
    
    router.put("/v3/:id", customers_v3.update);

  
    app.use('/api/customers', router);
  };
  