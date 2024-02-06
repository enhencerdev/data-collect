const db = require("../models");
const Purchase = db.purchases;
const Visitor = db.visitors;
const TatilBudur = db.tatilBudurPurchases;
const Mng = db.mngPurchases;
const Jolly = db.jollyPurchases;

const mongoose = db.mongoose;
const Mongoose = db.Mongoose;
// const PurchaseUserSchema = require("../models/nosql/purchaseUser.model");
const PurchaseUserSchema = db.purchaseUserSchema;
const UserModel = db.userModel;

async function updateVisitorsTable(userId, actionType, visitorID) {
  let visitorData = { visitorID: visitorID }
  // const UserModel = mongoose.model('user', PurchaseUserSchema, 'purchase_users');
  try {
    const userAggregation = UserModel.aggregate([
      { $match: { _id: new Mongoose.Types.ObjectId(userId) } },
      { $project: { "crmDetails.audienceNetworkSwitch": 1 } }
    ]);
    const user = await userAggregation.exec();
    if (user.length === 0) {
      return { "message": "no user" }
    } else if (!user[0].crmDetails || !user[0].crmDetails.audienceNetworkSwitch) {
      return { "message": "an_not_enabled" }
    }
  } catch (error) {
    throw error;
  }

  if (actionType === "basket") visitorData["addtoBasket"] = new Date();
  if (actionType === "purchase") visitorData["purchase"] = new Date();

  // Set table name
  Visitor.tableName = "visitor_data_" + userId;

  // Save Visitor in the database
  try {
    await Visitor.upsert(visitorData);
  } catch (error) {
    throw error;
  }
}

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
  } = JSON.parse(req.body);

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
        if (products) {
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
            await Purchase.upsert(newProduct);
          }
          await updateVisitorsTable(userID, purchase.actionType, purchase.visitorID);
          res.status(200).send({ result: "success" });

        }
        else {
          await Purchase.upsert(newProduct);
          await updateVisitorsTable(userID, purchase.actionType, purchase.visitorID);
          res.status(200).send({ result: "success" });
        }

      } catch (error) {
        res.status(500).send({
          message:
            error.message || "Some error occurred while creating the Purchase.",
        });
      }
    } else if (actionType === "basket") {
      newProduct.productID = productID;
      newProduct.type = "basket";

      try {
        await Purchase.upsert(newProduct);
        await updateVisitorsTable(userID, purchase.actionType, purchase.visitorID);
        res.status(200).send({ result: "success" });

      } catch (error) {
        res.status(500).send({
          message:
            error.message || "Some error occurred while creating the Purchase.",
        });
      }
    } else {
      const error = new Error("action type required");
      res.status(500).send(error.message);
    }
  }
  else if (purchase.type === "tatil-budur") {
    TatilBudur.tableName = "VISITOR_DATA_PURCHASE_" + purchase.userID;
    try {
      const tatilbudurPurchase = JSON.parse(req.body);
      tatilbudurPurchase['dateTime'] = new Date();
      tatilbudurPurchase['type'] = tatilbudurPurchase['actionName'] === undefined ? "" : tatilbudurPurchase['actionName'];
      await TatilBudur.create(tatilbudurPurchase);
      res.status(200).send({ result: "success" });
    }
    catch (error) {
      res.status(500).send({
        message:
          error.message || "Some error occurred while creating the Purchase.",
      });
    }
  }
  else if (purchase.type === "mng") {
    Mng.tableName = "VISITOR_DATA_PURCHASE_" + purchase.userID;
    try {
      const mngPurchase = JSON.parse(req.body);
      mngPurchase['dateTime'] = new Date();
      mngPurchase['type'] = mngPurchase['actionName'] === undefined ? "" : mngPurchase['actionName'];
      await Mng.create(mngPurchase);
      res.status(200).send({ result: "success" });
    }
    catch (error) {
      res.status(500).send({
        message:
          error.message || "Some error occurred while creating the Purchase.",
      });
    }

  }
  else if (purchase.type === "jolly") {
    Jolly.tableName = "VISITOR_DATA_PURCHASE_" + purchase.userID;
    try {
      const jollyPurchase = JSON.parse(req.body);
      jollyPurchase['dateTime'] = new Date();
      jollyPurchase['type'] = jollyPurchase['actionName'] === undefined ? "" : jollyPurchase['actionName'];
      await Jolly.create(jollyPurchase);
      res.status(200).send({ result: "success" });
    }
    catch (error) {
      res.status(500).send({
        message:
          error.message || "Some error occurred while creating the Purchase.",
      });
    }
  }
  else {
    const error = new Error('type required');
  }
};
