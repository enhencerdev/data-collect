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
  Product.tableName = "VISITOR_DATA_PRODUCT_" + product.userID;
  let retryCount = 0;
  const maxRetries = 3;
  const backoffMs = 100;

  while (retryCount < maxRetries) {
    try {
      await Product.upsert({
        ...product,
        pageCount: db.Sequelize.literal('COALESCE(pageCount, 0) + 1'),
        updated_at: new Date()
      }, {
        conflictFields: ['visitorID', 'productID', 'productCategory1', 'productCategory2', 'productCategory3', 'price']
      });
      return;
    } catch (error) {
      if (error.parent?.code === 'ER_LOCK_DEADLOCK' && retryCount < maxRetries - 1) {
        retryCount++;
        const jitter = Math.floor(Math.random() * 100);
        await new Promise(resolve => setTimeout(resolve, (backoffMs * Math.pow(2, retryCount)) + jitter));
        continue;
      }
      console.error('Product upsert error:', error);
      throw error;
    }
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
