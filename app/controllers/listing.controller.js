const db = require("../models");
const Listing = db.listings;
const TatilBudur = db.tatilBudurListings;
const Mng = db.mngListings;
const Jolly = db.jollyListings;

function updateListingData(listingData, type) {
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

exports.create = async (req, res) => {
  // Validate request
  /*if (!req.body.title) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }*/

  // Create a Customer
  const { visitorID, productCategory1, productCategory2, productCategory3 } =
    req.body;

  const listing = {
    visitorID,
    productCategory1,
    productCategory2,
    productCategory3,
  };

  updateListingData(listing, req.body.type);

  // Save Listing in the database
  if (req.body.type === "ecommerce") {
    Listing.tableName = "VISITOR_DATA_LISTING_" + req.body.userID;
    try {
      const createdListing = await Listing.upsert(listing);

      if (!createdListing[1]) {
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
          res.status(500).send({
            message: "Error occurred while updating the listing.",
            error: error.message,
          });
          return;
        }
      }
      res.status(200).send({ result: "success" });
    } catch (error) {
      res.status(500).send({
        message:
          error.message || "Some error occurred while creating the Listing.",
      });
    }
  }

  if (req.body.type === "tatil-budur") {
    TatilBudur.tableName = "VISITOR_DATA_LISTING_" + req.body.userID;
    try {
      await TatilBudur.create(listing);
      res.status(200).send({ result: "success" });
    }
    catch (error) {
      res.status(500).send({
        message:
          error.message || "Some error occurred while creating the Listing.",
      });
    }

  }

  if (req.body.type === "jolly") {
    Jolly.tableName = "VISITOR_DATA_LISTING_" + req.body.userID;

    try {
      await Jolly.create(listing);
      res.status(200).send({ result: "success" });
    }
    catch (error) {
      res.status(500).send({
        message:
          error.message || "Some error occurred while creating the Listing.",
      });
    }
  }

  if (req.body.type === "mng") {
    Mng.tableName = "VISITOR_DATA_LISTING_" + req.body.userID;

    try {
      await Mng.create(listing);
      res.status(200).send({ result: "success" });
    }
    catch (error) {
      res.status(500).send({
        message:
          error.message || "Some error occurred while creating the Listing.",
      });
    }
  }
};
