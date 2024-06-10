const db = require("../models");
const Product = db.products;
const TatilBudur = db.tatilBudurProducts;
const Mng = db.mngProducts;
const Jolly = db.jollyProducts;

const customers = require("../controllers/customer.controller.js");

exports.create = async (req, res) => {

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

  correctProductData(product, product.type);


  // Save Product in the database
  if (type === "ecommerce") {
    upsertProduct(product)
  }

  if (product.type === "tatil-budur") {
    TatilBudur.tableName = "VISITOR_DATA_PRODUCT_" + product.userID;

    const tatilbudurProduct = JSON.parse(req.body);
    TatilBudur.create(tatilbudurProduct);
  }

  if (product.type === "mng") {
    Mng.tableName = "VISITOR_DATA_PRODUCT_" + product.userID;

    const mngProduct = JSON.parse(req.body);
    Mng.create(mngProduct);
  }
  if (product.type === "jolly") {
    Jolly.tableName = "VISITOR_DATA_PRODUCT_" + product.userID;

    const jollyProduct = JSON.parse(req.body);
    Jolly.create(jollyProduct);
  }

  customers.upsertCustomer({ body: req.body })
  res.status(200).send({ result: "success" });
};

const upsertProduct = async (product) => {
  Product.tableName = "VISITOR_DATA_PRODUCT_" + product.userID;
  try {
    const createdProduct = await Product.upsert(product);

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
        return error
      }
    }
    
    return;

  } catch (error) {
    return error
  }
}

function correctProductData(productData, type) {
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
