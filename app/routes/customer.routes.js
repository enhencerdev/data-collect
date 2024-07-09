module.exports = app => {
    const customers = require("../controllers/customer.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Customer
    router.post("/", customers.create);
  
    //Update a Customer with id
    router.put("/:id", customers.update);
    
    router.post("/fbcapi/", customers.sendEventsToFacebookThroughConversionAPIWithoutScoring);
  
    app.use('/api/customers', router);
  };
  