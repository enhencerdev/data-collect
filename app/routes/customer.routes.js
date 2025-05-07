module.exports = app => {
    const customers = require("../controllers/customer.controller.js");
    const customers_v3 = require("../controllers/customer_v3.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Customer
    router.post("/v3", customers_v3.create);
    router.post("/", customers.create);
    
    // Handle PUT request without ID (with and without trailing slash)
    router.put("/", (req, res) => res.status(200).send({ result: "success" }));
    router.put("//", (req, res) => res.status(200).send({ result: "success" }));
    
    // Handle the "undefined" ID case that's causing crashes
    router.put("/undefined", (req, res) => {
      console.log(`[ALERT] Received PUT request with 'undefined' ID - IP: ${req.ip} - UserID: ${req.body?.userID} - Body:`, JSON.stringify(req.body));
      return res.status(200).send({ result: "success" });
    });
  
    // Score a Customer with id
    router.put("/:id", customers.update);
    router.put("/v3/:id", customers_v3.update);
    
    router.post("/fbcapi/", customers.sendEventsToFacebookThroughConversionAPIWithoutScoring);
    router.post("/v3/fbcapi/", customers_v3.sendEventsToFacebookThroughConversionAPIWithoutScoring);
  
    app.use('/api/customers', router);
  };
  