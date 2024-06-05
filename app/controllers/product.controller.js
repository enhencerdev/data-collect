const dbConfig = require("../config/db.config");
const db = require("../models");
const Product = db.products;
const Visitor = db.visitors;
const TatilBudur = db.tatilBudurProducts;
const Mng = db.mngProducts;
const Jolly = db.jollyProducts;

const mongoose = db.mongoose;
const Mongoose = db.Mongoose;
// const PurchaseUserSchema = require("../models/nosql/purchaseUser.model");
const PurchaseUserSchema = db.purchaseUserSchema;
const UserModel = db.userModel;

function updateProductData(productData, type) {
  if (type === "ecommerce") {
    productData["productID"] =
      productData["productID"] === undefined ||
        productData["productID"] === "undefined"
        ? ""
        : productData["productID"];
    productData["productCategory1"] =
      productData["productCategory1"] === undefined ||
        productData["productCategory1"] === "undefined"
        ? ""
        : productData["productCategory1"];
    productData["productCategory2"] =
      productData["productCategory2"] === undefined ||
        productData["productCategory2"] === "undefined"
        ? ""
        : productData["productCategory2"];
    productData["productCategory3"] =
      productData["productCategory3"] === undefined ||
        productData["productCategory3"] === "undefined"
        ? ""
        : productData["productCategory3"];
  }
  productData["city"] =
    productData["city"] === undefined || productData["city"] === "undefined"
      ? ""
      : productData["city"];
  productData["country"] =
    productData["country"] === undefined ||
      productData["country"] === "undefined"
      ? ""
      : productData["country"];
  productData["deviceType"] =
    productData["deviceType"] === undefined ||
      productData["deviceType"] === "undefined"
      ? ""
      : productData["deviceType"];
}

async function updateVisitorsTable(userId, visitorData) {
  let productCategories = [];
  let visitor = {};
  /* const UserModel = mongoose.model(
    "user",
    PurchaseUserSchema,
    "purchase_users"
  ); */
  try {
    const userAggregation = UserModel.aggregate([
      { $match: { _id: new Mongoose.Types.ObjectId(userId) } },
      { $project: { productCategories: 1, "crmDetails.audienceNetworkSwitch": 1 } }
    ]);
    console.log("----will get user")
    const user = await userAggregation.exec();
    console.log("----user geldi ", user)
    if (user.length === 0) {
      return { "message": "no user" }
    } else if (!user[0].crmDetails || !user[0].crmDetails.audienceNetworkSwitch) {
      return { "message": "an_not_enabled" }
    } else {

      if (user[0].productCategories) {
        productCategories = user[0].productCategories;
      }
      // const foundCat = this.findBy(productCategories, "productCategory2", visitorData["category"]);
      const foundCat = productCategories.find(function (productCategory) {
        return productCategory["productCategory2"] === visitorData["category"];
      });
      if (foundCat) {
        visitorData[foundCat.columnName] = new Date();
      }
      
    }
    
    console.log("----continue")
  } catch (error) {
    throw error;
  }
  
  // Set table name
  Visitor.tableName = "visitor_data_" + userId;
  
  // Save Visitor in the database
  try {
    console.log("----az kaldiiii")
    await Visitor.upsert(visitorData);
    console.log("----bitti burasi")
  } catch (error) {
    throw error;
  }
}

exports.create = async (req, res) => {
  /* console.log("in product")
  console.log("ddbb ", process.env)
  res.status(200).send({ result: "success" });
  return */
  // Validate request
  /*if (!req.body.title) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }*/

  // Create a Product
  const {
    visitorID,
    productID,
    productCategory1,
    productCategory2,
    productCategory3,
    price,
    userID,
    type,
  } = JSON.parse(req.body);

  const product = {
    visitorID,
    productID,
    productCategory1,
    productCategory2,
    productCategory3,
    price,
    userID,
    type,
  };

  console.log("----1")
  updateProductData(product, product.type);
  
  console.log("----2")
  
  // Save Product in the database
  if (type === "ecommerce") {
    console.log("----3")
    Product.tableName = "VISITOR_DATA_PRODUCT_" + product.userID;
    console.log("----4")
    try {
      const createdProduct = await Product.upsert(product);
      console.log("----5 ", createdProduct)
      
      if (!createdProduct) {
        // If column already exists, update pageCount
        const {
          visitorID,
          productID,
          productCategory1,
          productCategory2,
          productCategory3,
          price,
        } = product;

        console.log("----6")
        
        try {
          await Product.update(
            { pageCount: db.Sequelize.literal("pageCount + 1") },
            {
              where: {
                visitorID: visitorID,
                productID: productID,
                productCategory1: productCategory1,
                productCategory2: productCategory2,
                productCategory3: productCategory3,
                price: price,
              },
            }
          );
          console.log("----88")
        } catch (error) {
          console.log("----nooo")
          res.status(500).send({
            message: "Error occurred while updating the product.",
            error: error.message,
          });
          return;
        }
      }
      console.log("----99")
      await updateVisitorsTable(userID, { category: product.productCategory2, visitorID: product.visitorID });
      console.log("----last")
      res.status(200).send({ result: "success" });
    } catch (error) {
      res.status(500).send({
        message:
          error.message || "Some error occurred while creating the Product.",
      });
    }
  }

  if (product.type === "tatil-budur") {
    TatilBudur.tableName = "VISITOR_DATA_PRODUCT_" + product.userID;
    try {
      const tatilbudurProduct = JSON.parse(req.body);
      await TatilBudur.create(tatilbudurProduct);
      res.status(200).send({ result: "success" });
    }
    catch (error) {
      res.status(500).send({
        message:
          error.message || "Some error occurred while creating the Product.",
      });
    }
  }
  if (product.type === "mng") {
    Mng.tableName = "VISITOR_DATA_PRODUCT_" + product.userID;
    try {
      const mngProduct = JSON.parse(req.body);
      await Mng.create(mngProduct);
      res.status(200).send({ result: "success" });
    }
    catch (error) {
      res.status(500).send({
        message:
          error.message || "Some error occurred while creating the Product.",
      });
    }
  }
  if (product.type === "jolly") {
    Jolly.tableName = "VISITOR_DATA_PRODUCT_" + product.userID;
    try {
      const jollyProduct = JSON.parse(req.body);
      await Jolly.create(jollyProduct);
      res.status(200).send({ result: "success" });
    }
    catch (error) {
      res.status(500).send({
        message:
          error.message || "Some error occurred while creating the Product.",
      });
    }
  }
};
