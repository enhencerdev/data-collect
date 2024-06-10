const db = require("../models");
const Listing = db.listings;
const TatilBudur = db.tatilBudurListings;
const Mng = db.mngListings;
const Jolly = db.jollyListings;

const customers = require("../controllers/customer.controller.js");

exports.create = async (req, res) => {
  // Validate request
  /*if (!req.body.title) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }*/

  // Create a Customer
  const { userID, visitorID, type, productCategory1, productCategory2, productCategory3 } = JSON.parse(req.body);

  const listing = {
    visitorID,
    productCategory1,
    productCategory2,
    productCategory3,
  };

  correctListingData(listing, type);
  // Save Listing in the database
  if (type === "ecommerce") {
    upsertListing(listing, userID)
  }

  if (type === "tatil-budur") {
    TatilBudur.tableName = "VISITOR_DATA_LISTING_" + userID;
    const tatilbudurListing = JSON.parse(req.body);
    TatilBudur.create(tatilbudurListing);

  }

  if (type === "jolly") {
    Jolly.tableName = "VISITOR_DATA_LISTING_" + userID;
    const jollyListing = JSON.parse(req.body);
    Jolly.create(jollyListing);
  }

  if (type === "mng") {
    Mng.tableName = "VISITOR_DATA_LISTING_" + userID;
    const mngListing = JSON.parse(req.body);
    Mng.create(mngListing);
  }


  customers.upsertCustomer({ body: req.body })
  res.status(200).send({ result: "success" });
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