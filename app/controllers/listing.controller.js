const db = require("../models");
const Listing = db.listings;
const TatilBudur = db.tatilBudurListings;
const CruiseBooking = db.cruiseBookingListings;
const redis = require('../config/redis');
const customers = require("../controllers/customer.controller.js");

exports.create = async (req, res) => {
  try {
    const { userID, visitorID, type, productCategory1, productCategory2, productCategory3 } = req.body;
    
    if (redis) {
      const missingCustomerTables = await redis.smembers('missing_customer_tables');
      if (missingCustomerTables && missingCustomerTables.includes(userID)) {
        return res.send({ message: "failure" });
      }
    }

    const listing = {
      visitorID,
      productCategory1,
      productCategory2,
      productCategory3,
    };

    correctListingData(listing, type);

    if (type === "ecommerce") {
      await upsertListing(listing, userID);
    } else if (type === "tatil-budur") {
      TatilBudur.tableName = "VISITOR_DATA_LISTING_" + userID;
      await TatilBudur.create(req.body);
    } else if (type === "cruise-booking") {
      CruiseBooking.tableName = "VISITOR_DATA_LISTING_" + userID;
      await CruiseBooking.create(req.body);
    }

    await customers.upsertCustomer({ body: req.body });
    return res.status(200).send({ result: "success" });
  } catch (error) {
    console.error('Listing creation error:', error);
    return res.status(500).send({
      message: "Error processing request",
      error: error.message
    });
  }
};


const upsertListing = async (listing, userID) => {
  Listing.tableName = "VISITOR_DATA_LISTING_" + userID;
  try {
    const createdListing = await Listing.upsert(listing);
    if (!createdListing) {
      // If column already exists, update pageCount
      const {
        visitorID,
        productCategory1,
        productCategory2,
        productCategory3,
      } = listing;

      try {
        await Listing.update(
          { pageCount: db.Sequelize.literal("pageCount + 1") },
          {
            where: {
              visitorID: visitorID,
              productCategory1: productCategory1,
              productCategory2: productCategory2,
              productCategory3: productCategory3,
            },
          }
        );
      } catch (error) {
        return error
      }
    }
    return "success"
  } catch (error) {
    return error
  }
}


function correctListingData(listingData, type) {
  if (type === "ecommerce") {
    listingData["productCategory1"] =
      listingData["productCategory1"] === undefined ||
        listingData["productCategory1"] === "undefined"
        ? ""
        : listingData["productCategory1"];
    listingData["productCategory2"] =
      listingData["productCategory2"] === undefined ||
        listingData["productCategory2"] === "undefined"
        ? ""
        : listingData["productCategory2"];
    listingData["productCategory3"] =
      listingData["productCategory3"] === undefined ||
        listingData["productCategory3"] === "undefined"
        ? ""
        : listingData["productCategory3"];
  }
  listingData["city"] =
    listingData["city"] === undefined || listingData["city"] === "undefined"
      ? ""
      : listingData["city"];
  listingData["country"] =
    listingData["country"] === undefined ||
      listingData["country"] === "undefined"
      ? ""
      : listingData["country"];
  listingData["deviceType"] =
    listingData["deviceType"] === undefined ||
      listingData["deviceType"] === "undefined"
      ? ""
      : listingData["deviceType"];
}