module.exports = app => {
    const visitors = require("../controllers/visitor.controller.js");
  
    var router = require("express").Router();
  
    router.post("/", visitors.create);
    
    app.use('/api/visitors', router);
  };
  