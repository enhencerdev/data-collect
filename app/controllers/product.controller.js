const db = require("../models");
const Product = db.products;
const TatilBudur = db.tatilBudurProducts;
const CruiseBooking = db.cruiseBookingProducts;
const redis = require('../config/redis');
const customers = require("../controllers/customer.controller.js");

exports.create = async (req, res) => {
  try {
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

    if (redis) {
      const missingCustomerTables = await redis.smembers('missing_customer_tables');
      if (missingCustomerTables && missingCustomerTables.includes(userID)) {
        return res.send({ message: "failure" });
      }
    }

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

    try {
      if (type === "ecommerce") {
        await upsertProduct(product);
      } else if (type === "tatil-budur") {
        TatilBudur.tableName = "VISITOR_DATA_PRODUCT_" + userID;
        await TatilBudur.create(req.body);
      } else if (type === "cruise-booking") {
        CruiseBooking.tableName = "VISITOR_DATA_PRODUCT_" + userID;
        await CruiseBooking.create(req.body);
      } else {
        throw new Error("Invalid product type");
      }

      await customers.upsertCustomer({ body: req.body });
      return res.status(200).send({ result: "success" });
    } catch (error) {
      throw new Error(`Failed to process product: ${error.message}`);
    }
  } catch (error) {
    console.error('Product creation error:', error);
    return res.status(500).send({
      message: "Error processing request",
      error: error.message
    });
  }
};

const upsertProduct = async (product) => {
  try {
    Product.tableName = "VISITOR_DATA_PRODUCT_" + product.userID;
    const createdProduct = await Product.upsert(product);

    if (!createdProduct) {
      const {
        visitorID,
        productID,
        productCategory1,
        productCategory2,
        productCategory3,
        price,
      } = product;

      await Product.update(
        { pageCount: db.Sequelize.literal("pageCount + 1") },
        {
          where: {
            visitorID,
            productID,
            productCategory1,
            productCategory2,
            productCategory3,
            price,
          },
        }
      );
    }
    return;
  } catch (error) {
    console.error('Product upsert error:', error);
    throw error;
  }
};

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
