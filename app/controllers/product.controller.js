const db = require("../models");
const Product = db.products;
const TatilBudur = db.tatilBudurProducts;
const Mng = db.mngProducts;
const Jolly = db.jollyProducts;

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
exports.create = async (req, res) => {
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
  } = req.body;

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

  updateProductData(product, product.type);

  // Save Product in the database
  if (type === "ecommerce") {
    Product.tableName = "VISITOR_DATA_PRODUCT_" + product.userID;
    try {
      const createdProduct = await Product.upsert(product);

      if (!createdProduct[1]) {
        // If column already exists, update pageCount
        const {
          visitorID,
          productID,
          productCategory1,
          productCategory2,
          productCategory3,
          price,
        } = product;
        console.log("UPDATE PAGE COUNT");
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
        } catch (error) {
          res.status(500).send({
            message: "Error occurred while updating the product.",
            error: error.message,
          });
          return;
        }
      }
      res.status(200).send({result: "success"});
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
      await TatilBudur.create(product);
      res.status(200).send({ result: "success" });
    }
    catch (error) {
      res.status(500).send({
        message:
          error.message || "Some error occurred while creating the product.",
      });
    }
  }
  if(product.type === "mng"){
    Mng.tableName = "VISITOR_DATA_PRODUCT_" + product.userID;
    try {
      await Mng.create(product);
      res.status(200).send({ result: "success" });
    }
    catch (error) {
      res.status(500).send({
        message:
          error.message || "Some error occurred while creating the product.",
      });
    }
  }
  if(product.type === "jolly"){
    Jolly.tableName = "VISITOR_DATA_PRODUCT_" + product.userID;
    try {
      await Jolly.create(product);
      res.status(200).send({ result: "success" });
    }
    catch (error) {
      res.status(500).send({
        message:
          error.message || "Some error occurred while creating the product.",
      });
    }
  }
};
