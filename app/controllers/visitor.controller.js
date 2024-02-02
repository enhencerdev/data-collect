const db = require("../models");
const Visitor = db.visitors;
//const purchaseUser = db.purchaseUser;
//onst Mongoose = require('mongoose');
const mongoose = db.mongoose;
const Mongoose = db.Mongoose;

const PurchaseUserSchema = require("../models/nosql/purchaseUser.model");

function updateVisitorData(visitorData, productCategories) {

  if (visitorData["addtoBasket"]) {
    visitorData["addtoBasket"] = new Date();
  }

  if (visitorData["purchase"]) {
    visitorData["purchase"] = new Date();
  }

  const foundCat = findBy(
    productCategories,
    "productCategory2",
    visitorData["category"]
  );
  if (foundCat) {
    visitorData[foundCat.columnName] = new Date();
  }
}

function findBy(array, propertyName, value) {
  const foundElement = array.find(function (element) {
    return element[propertyName] === value;
  });
  return foundElement;
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
    userID,
    type,
    fbExtID,
    userAgent,
    userDomain,
    score,
    uplift,
    category,
    ipAddress
  } = req.body;

  const visitor = {
    visitorID,
    userID,
    type,
    fbExtID,
    userAgent,
    userDomain,
    score,
    uplift,
    category,
    ipAddress
  };


  Visitor.tableName = "VISITOR_DATA";

  let facebookAds = {};
  let productCategories = [];
  //let createdVisitor = {};

  //creates a Mongoose model. Collection name is 'purchase_users', schema is 'PurchaseUserSchema', model name is 'user'
  const UserModel = mongoose.model(
    "user",
    PurchaseUserSchema,
    "purchase_users"
  );

  try {
    const userAggregation = UserModel.aggregate([
      //This pipeline aims to retrieve user data matching userID
      { $match: { _id: new Mongoose.Types.ObjectId(userID) } },
      {
        $project: {
          token: 1,
          key: 1,
          productCategories: 1,
          "googleAds.conversionId": 1,
          facebookAds: 1,
        },
      },
    ]);


    const user = await userAggregation.exec(); //get the user data



    if (user.length === 0)
      return { message: "no user" }; //if user is not found, return
    else if (!user[0].token && !user[0].key) {
      //if user is found but token and key are not found, return
      return { message: "no token and key" };
    } else {
      if (user[0].facebookAds) {
        facebookAds = user[0].facebookAds;
      }
      if (user[0].productCategories) {
        productCategories = user[0].productCategories;
      }
      updateVisitorData(visitor, productCategories);
     
      await Visitor.upsert(visitor);
      res.status(200).send({ result: "success" });
    }
  } catch (error) {
    res.status(500).send({
      message:
        error.message || "Some error occurred while creating the Visitor.",
    });
  }
};
