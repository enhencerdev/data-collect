const db = require("../models");
const Purchase = db.purchases;
const TatilBudur = db.tatilBudurPurchases;
const CruiseBooking = db.cruiseBookingPurchases;
const redis = require('../config/redis');
const customers = require("../controllers/customer.controller.js");

exports.create = async (req, res) => {
  try {
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

    if (redis) {
      const missingCustomerTables = await redis.smembers('missing_customer_tables');
      
      if (missingCustomerTables && missingCustomerTables.includes(userID)) {
        return res.send({
          message: "failure"
        });
      }
    }

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
      upsertPurchase({ actionType, purchase, visitorID, userID, productID })
    }
    else if (purchase.type === "tatil-budur") {
      TatilBudur.tableName = "VISITOR_DATA_PURCHASE_" + purchase.userID;

      const tatilbudurPurchase = req.body;
      tatilbudurPurchase['dateTime'] = new Date();
      tatilbudurPurchase['type'] = tatilbudurPurchase['actionName'] === undefined ? "" : tatilbudurPurchase['actionName'];
      TatilBudur.create(tatilbudurPurchase);
    }
    else if (purchase.type === "cruise-booking") {
      CruiseBooking.tableName = "VISITOR_DATA_PURCHASE_" + purchase.userID;

      const cruiseBookingPurchase = req.body;
      cruiseBookingPurchase['dateTime'] = new Date();
      cruiseBookingPurchase['type'] = cruiseBookingPurchase['actionName'] === undefined ? "" : cruiseBookingPurchase['actionName'];
      CruiseBooking.create(cruiseBookingPurchase);
    }
    else {
      console.log("Error: type required")
    }

    customers.upsertCustomer({ body: req.body })
    res.status(200).send({ result: "success" });
  } catch (error) {
    console.error('Purchase creation error:', error);
    return res.status(400).send({
      message: "Invalid request format",
      error: error.message
    });
  }
};


const upsertPurchase = async ({ actionType, purchase, visitorID, userID, productID }) => {

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
      if (products) {
        for (const product of products) {
          correctProductDetails(product, newProduct)
          await Purchase.upsert(newProduct);
        }
        return "success"

      }
      else {
        await Purchase.upsert(newProduct);
        return "success"
      }

    } catch (error) {
      return error
    }

  } else if (actionType === "basket") {
    newProduct.productID = productID;
    newProduct.type = "basket";

    try {
      await Purchase.upsert(newProduct);


    } catch (error) {
      return error
    }
  } else {
    const error = new Error("action type required");
    // res.status(500).send(error.message);
    return error
  }




}

const correctProductDetails = (product, newProduct) => {
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


  return newProduct
}