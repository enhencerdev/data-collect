const db = require("../models");
const Purchase = db.purchases;
const TatilBudur = db.tatilBudurPurchases;
const Mng = db.mngPurchases;
const Jolly = db.jollyPurchases;

exports.create = async (req, res) => {
  // Validate request
  /*if (!req.body.title) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }*/

  const {
    visitorID,
    dateTime,
    basketID,
    productID,
    amount,
    price,
    type,
    actionType,
    userID,
    products,
  } = req.body;

  const purchase = {
    visitorID,
    dateTime,
    basketID,
    productID,
    amount,
    price,
    type,
    actionType,
    userID,
    products,
  };

  // Save Listing in the database
  if (purchase.type === "ecommerce") {
    let newProduct = {
      visitorID: visitorID,
      dateTime: new Date(),
    };
    Purchase.tableName = "VISITOR_DATA_PURCHASE_" + userID;

    if (actionType === "purchase") {
      const { basketID, products } = purchase;
      newProduct.basketID = basketID;
      newProduct.type = "purchase";

      try {
        const createdPurchases = [];
        if(products){
          for (const product of products) {
            newProduct.productID =
              product.ID === undefined || product.ID === "undefined"
                ? ""
                : product.ID;
            if (
              product.id !== undefined &&
              product.id !== "undefined" &&
              product.id !== null
            ) {
              newProduct.productID = product.id;
            }
            newProduct.amount =
              product.amount === undefined || product.amount === "undefined"
                ? null
                : product.amount;
            if (
              product.quantity !== undefined &&
              product.quantity !== "undefined" &&
              product.quantity !== null
            ) {
              newProduct.amount = product.quantity;
            }
            newProduct.price =
              product.price === undefined || product.price === "undefined"
                ? null
                : product.price;
  
            //let purchase = new Purchase(newProduct);
            const createdPurchase = await Purchase.upsert(newProduct);
            createdPurchases.push(createdPurchase);
            res.status(200).send({ result: "success"});
          }

        }
        else{
          const createdPurchase = await Purchase.upsert(newProduct);
          createdPurchases.push(createdPurchase);
          res.status(200).send({ result: "success"});

        }
    
        
        
      } catch (error) {
        res.status(500).send({
          message:
            error.message || "Some error occurred while creating the Listing.",
        });
      }
    } else if (actionType === "basket") {
      newProduct.productID = productID;
      newProduct.type = "basket";
      
      try {
        // await this.purchasesRepository.add(userID, type, purchase);
        await Purchase.upsert(newProduct);
        res.status(200).send({ result: "success"});
        
      } catch (error) {
        res.status(500).send({
          message:
            error.message || "Some error occurred while creating the Listing.",
        });
      }
    } else {
      const error = new Error("action type required");
      res.status(500).send(error.message);
    }
  }
  else if(purchase.type === "tatil-budur"){
    purchase.actionType = purchase.actionType === undefined ? "" : purchase.actionType;
    TatilBudur.tableName = "VISITOR_DATA_PURCHASE_" + purchase.userID;
    try{
      await TatilBudur.create(purchase);
      res.status(200).send({ result: "success" });
    }
    catch (error) {
      res.status(500).send({
        message:
          error.message || "Some error occurred while creating the purchase.",
      });
    }
  }
  else if(product.type === "mng"){
    purchase.actionType = purchase.actionType === undefined ? "" : purchase.actionType;
    Mng.tableName = "VISITOR_DATA_PURCHASE_" + purchase.userID;
    try{
      await Mng.create(purchase);
      res.status(200).send({ result: "success" });
    }
    catch (error) {
      res.status(500).send({
        message:
          error.message || "Some error occurred while creating the purchase.",
      });
    }
    
  }
  else if(product.type === "jolly"){
    purchase.actionType = purchase.actionType === undefined ? "" : purchase.actionType;
    Jolly.tableName = "VISITOR_DATA_PURCHASE_" + purchase.userID;
    try{
      await Jolly.create(purchase);
      res.status(200).send({ result: "success" });
    }
    catch (error) {
      res.status(500).send({
        message:
          error.message || "Some error occurred while creating the purchase.",
      });
    }
  }
  else {
    const error = new Error('type required');
    console.log(error.message);
  }
};
