const db = require("../models");
const CryptoJS = require("crypto-js");
const axios = require('axios');
const requestIp = require('request-ip');
const Customer = db.customers_v3;
const Mongoose = db.Mongoose;
const sequelize = db.sequelize;
const UserModel = db.userModel;
const ProjectModel = db.projectModel;
const ModelModel = db.modelModel;

const redis = require('../config/redis');

exports.create = async (req, res) => {
  upsertCustomer({ body: req.body })
  res.status(200).send({ result: "success" });
}


const upsertCustomer = async ({ body }) => {

  const {
    userId,
    visitorID,
    customerID,
    deviceType,
    scrollPercentage,
    searched,
    sessionDuration,
    actionType,
    source,
    purchase_propensity,
  } = JSON.parse(body);

  const customer = {
    userId,
    visitorID,
    customerID,
    deviceType,
    scrollPercentage,
    searched,
    sessionDuration,
    actionType,
    source,
    purchase_propensity,
  };


  if (redis) {
    const missingCustomerTables = await redis.smembers('missing_customer_tables');
    if (missingCustomerTables && missingCustomerTables.includes(userId)) {
      console.log(`=================== Table missing for userID ${userId}`);
      return {
        message: "failure"
      }
    }
  }

  // Update customer data
  correctCustomerData(customer);

  // Set table name
  Customer.tableName = "visitor_data_customer_" + userId;

  // Save Customer in the database
  try {
    return "success"
  } catch (error) {

    if (redis && error.name === 'SequelizeDatabaseError' && error.parent?.code === 'ER_NO_SUCH_TABLE') {
      await redis.sadd('missing_customer_tables', userId);
      console.log(`=================== Added userID ${userId} to missing_customer_tables set in Redis`);
    }
    return error
  }
};

// Update a Customer by the id in the request
exports.update = async (req, res) => {
  const ipAddress = requestIp.getClientIp(req);
  const {
    visitorID = req.params.id,
    userId,
    fbp,
    fbc,
    userAgent,
    eventSourceUrl,
  } = JSON.parse(req.body);

  let updatedData = {};
  let resultObject = {};
  let facebookAds = {};
  let enhencerCategories;


  console.log("start ", userId)
  try {
    const user = await UserModel.findOne(
      { _id: new Mongoose.Types.ObjectId(userId) },
      {
        country: 1,
        'crmDetails.country': 1,
        'crmDetails.subscription': 1,
        'crmDetails.isAudienceNetworkEnabled': 1,
        'enhencerCategories': 1,
        'googleAds.conversionId': 1,
        'facebookAds': 1,
        'tiktokAds': 1,
        'key': 1,
        'token': 1
      },
    ).lean();


    let resultObject = {
      "score": -1,
      "audienceEvents": [],
      capito: facebookAds.accessToken,
      fbpid: facebookAds.pixelId
    };

    let fbEvents = []

    if (!user) {
      //if user does not exist

      return res.status(404).send({
        message: "No user."
      });

    } else if (!user.crmDetails || !user.crmDetails.subscription || user.crmDetails.subscription.status !== "Recurring") {
      //if user status is not recurring
      return res.status(202).send({
        message: "not_recurring",
        isAnEnabled: user.crmDetails.isAudienceNetworkEnabled,
        enhencerCategories: user.enhencerCategories,
        country: user.country
      });

    } else if (!user.token && !user.key) {
      //if user is found but token and key are not found - no model
      resultObject["Likely to buy"] = -1;
      resultObject["Likely to buy segment"] = -1;
      resultObject["isAnEnabled"] = !!user.crmDetails && user.crmDetails.isAudienceNetworkEnabled

      let uniqId = Date.now().toString() + Math.floor(Math.random() * 10000).toString();
      let eventId = "eid." + uniqId.substring(5) + "." + visitorID;

      resultObject["campaigns"] = [
        {
          name: "enh_conv_rem",
          adPlatform: "Facebook",
          eventId: eventId,
        }
      ];
      updatedData = {
        score: null,
        enhencer_audience_1: 1,
        enh_conv_rem: 1,
      };


    } else {

      // has model
      if (user.facebookAds) {
        facebookAds = user.facebookAds;
      }
      if (user.enhencerCategories) {
        enhencerCategories = user.enhencerCategories;
      }
      
      const project = await ProjectModel.findOne({
        userId: new Mongoose.Types.ObjectId(userId)
      },
        {
          "audienceModel.dataPrepQuery": 1,
          "audienceEvents": 1
        }).lean()


      if (!project) {
        return res.send({ "message": "no project" });
      }

      const query = getQuery({
        dataPrepQuery: project.audienceModel.dataPrepQuery,
        visitorId: visitorID,
        userId
      })


      const queryResult = await sequelize.query(query, { raw: true, type: sequelize.QueryTypes.SELECT });
      if (!queryResult || queryResult.length === 0) {
        return res.send({ "message": "No result" });
      }


      const customerData = queryResult[0]

      const isAudienceNetworkEnabled = !!user.crmDetails && user.crmDetails.isAudienceNetworkEnabled;

      if (customerData) {
        let score = await scoreRandomForest({
          userId,
          customerData
        })

        resultObject.score = score

        // isAnEnabled is a flag for new audience network structure
        if (isAudienceNetworkEnabled && enhencerCategories) {
          resultObject.enhencerCategories = enhencerCategories.toString();
        }


        const now = Date.now();
        const lastEditedAt = new Date(customerData["Last Edited At"]);
        const daysSinceLastUpdate = (now - lastEditedAt.getTime()) / (1000 * 3600 * 24);

        const purchased = customerData["purchase_time"];
        const purchasedAt = new Date(purchased);
        const daysSincePurchase = (now - purchasedAt.getTime()) / (1000 * 3600 * 24);

        const addToBasketAction = customerData["last_add_to_basket_time"];
        const addToBasketActionAt = new Date(addToBasketAction);
        const daysSinceAddToBasket = (now - addToBasketActionAt.getTime()) / (1000 * 3600 * 24);

        let events = []
        project.audienceEvents.forEach(audienceEvent => {
          const retentionDay = audienceEvent.retentionDay ?? 31;

          if (
            (daysSinceLastUpdate < retentionDay) &&
            (
              (score > audienceEvent.conditions.cutOffPurchasePropensity) ||
              (audienceEvent.conditions.includeAddtoBaskets && addToBasketAction && daysSinceAddToBasket < retentionDay) ||
              (audienceEvent.conditions.includePurchases && purchased && daysSincePurchase < retentionDay)
            )
          ) {

            const uniqId = Date.now().toString() + Math.floor(Math.random() * 10000).toString();
            const eventId = "eid." + uniqId.substring(5) + "." + visitorID;

            let event = {
              name: audienceEvent.eventName,
              adPlatform: audienceEvent.adPlatform,
              eventId
            }

            const bundles = createFilterCategories(customerData, audienceEvent.filterBundles);
            if (bundles.length > 0) {
              event.bundles = bundles
            }

            if (fbp) {
              let fbEvent = {
                "event_name": audienceEvent.eventName,
                "event_id": eventId,
                "event_time": parseInt(Date.now() / 1000),
                "action_source": "website",
                "event_source_url": eventSourceUrl,
                "user_data": {
                  "fbp": fbp,
                  "client_ip_address": ipAddress,
                  "client_user_agent": userAgent
                }
              }

              if (fbc) {
                fbEvent.fbc = fbc
              }

              fbEvents.push(fbEvent)
            }


            events.push(event)
          }
        })

        resultObject.audienceEvents = events;
      }

      resultObject.isAnEnabled = isAudienceNetworkEnabled;
      if (user.tiktokAds) resultObject.tiktok = 1

    }

    resultObject.country = user.country;
    if (!resultObject.country || resultObject.country === "") {
      if (user.crmDetails) {
        resultObject.country = user.crmDetails.country;
      }
    }
    if (user.googleAds && user.googleAds.conversionId) {
      resultObject.conversionId = user.googleAds.conversionId;
    }



    if (fbEvents.length > 0) { }


    if (facebookAds.pixelId && facebookAds.accessToken && fbEvents.length) {
      sendEventsToFacebookThroughConversionAPI({
        pixelId: facebookAds.pixelId,
        accessToken: facebookAds.accessToken,
        fbEvents,
        userId
      });
    }

    updateVisitorAfterScoring({
      userId,
      visitorData: {
        visitorID: visitorID,
        purchase_propensity: resultObject.score,
        audience_events: JSON.stringify(resultObject.audienceEvents.map(event => {
          return event.name.replace("enh_", "")
        })),
      }
    })


    return res.send(resultObject);

  } catch (error) {
    return res.status(500).send({
      message:
        error.message || "Some error occurred while scoring the Customer.",
    });
  }
};

const updateVisitorAfterScoring = async ({
  visitorData,
  userId
}) => {
  Customer.tableName = "VISITOR_DATA_CUSTOMER_" + userId;
  const transaction = await Customer.sequelize.transaction();

  try {
    await Customer.update(visitorData, {
      where: { visitorID: visitorData.visitorID },
      transaction
    });
    
    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    return false;
  }
}

function getQuery({
  dataPrepQuery,
  userId,
  visitorId
}) {
  const visitorDataCustomerTable = "VISITOR_DATA_CUSTOMER_" + userId;
  const visitorDataProductTable = "VISITOR_DATA_PRODUCT_" + userId;
  const visitorDataListingTable = "VISITOR_DATA_LISTING_" + userId;

  let index = dataPrepQuery.indexOf("FROM " + visitorDataCustomerTable);
  let query = dataPrepQuery.slice(0, index) + "FROM " + visitorDataCustomerTable + " WHERE visitorID = " + "'" + visitorId + "' " + dataPrepQuery.slice(index).replace("FROM " + visitorDataCustomerTable + " WHERE visitorID = ", "");

  index = query.indexOf("FROM " + visitorDataProductTable);
  query = query.slice(0, index) + "FROM " + visitorDataProductTable + " WHERE visitorID = " + "'" + visitorId + "' " + query.slice(index).replace("FROM " + visitorDataProductTable, "");

  index = query.indexOf("FROM " + visitorDataListingTable);
  query = query.slice(0, index) + "FROM " + visitorDataListingTable + " WHERE visitorID = " + "'" + visitorId + "' " + query.slice(index).replace("FROM " + visitorDataListingTable, "");
  return query;
}



const scoreRandomForest = async ({ resultObject, customerData, updatedData, userId }) => {

  /* console.log(">>>>>> will score customer")
  console.log(customerData) */

  try {
    const scoreResult = await axios.post(`${process.env.PYTHON_AI_AUDIENCE_MODEL_URL || 'http://localhost:8000'}/score`, {
      visitor_id: customerData.VisitorID,
      customer_id: userId,
      features: customerData
    })

    console.log("--------- scoring result came ", scoreResult.data)
    return scoreResult.data.prediction;

  } catch (err) {
    console.log("--------- err while scoring ", err)
    return;
  }

}

function createFilterCategories(customerData, filterBundles) {
  let count;
  let categoryName;
  let bundles = [];
  if (!filterBundles || filterBundles.length === 0) {
    return bundles;
  }

  for (let filterBundle of filterBundles) {
    count = 0;
    for (let category of filterBundle.selectedCategories) {
      if (category.type === "Product") {
        categoryName = category.name + "(Distinct Count Product)";
        if (customerData[categoryName] > 0) {
          count++
          break;
        }
      } else {
        if (category.type === "Listing1" || category.type === "Listing") {
          categoryName = category.name + "(Listing Page Visit PC1)";
          if (customerData[categoryName] > 0) {
            count++
            break;
          }
        } else if (category.type === "Listing2") {
          categoryName = category.name + "(Listing Page Visit PC2)";
          if (customerData[categoryName] > 0) {
            count++
            break;
          }
        }
      }
    };
    if (count !== 0) {
      bundles.push({
        "name": filterBundle.name,
        "value": 1,
      })
    } else {
      bundles.push({
        "name": filterBundle.name,
        "value": 0,
      })
    }
    // return count !== 0 ? true : false;
  };

  return bundles;
}

async function sendEventsToFacebookThroughConversionAPI({
  pixelId,
  accessToken,
  fbEvents,
  userId
}) {
  console.log("sendEventsToFacebookThroughConversionAPI for userId", fbData)
  console.log("pixel id: ", pixelId, ", accessToken: ", accessToken)

  if (fbEvents && fbEvents.length > 0) {
    console.log("inside")
    let url = `https://graph.facebook.com/v20.0/${pixelId}/events?access_token=${accessToken}`
    try {
      const fbResult = await axios.post(url, {
        data: fbEvents
      })
      console.log("--------- result came for conversions api for user ", userId)
      return;
    } catch (err) {
      console.log("catch fb conv api error for user ", userId, ": ", {
        error: err.response.data.error || err.response.data || "No error data",
        userId
      })

      /* await FacebookLogModel.create({
        // error: err.response.data.error || err.response.data || "No error data",
        userId
      }); */
      return;
    }
  } else {
    return;
  }
}

function correctCustomerData(customerData) {
  customerData["deviceType"] =
    customerData["deviceType"] === undefined ||
      customerData["deviceType"] === "undefined"
      ? ""
      : customerData["deviceType"];

  if (customerData["source"]) {
    customerData["source"] = customerData["source"].substring(0, 120)
  }

  if (customerData["actionType"]) {
    if (customerData["actionType"] === "product") {
      customerData["last_product_view_time"] = new Date();

    } else if (customerData["actionType"] === "basket") {
      customerData["last_add_to_basket_time"] = new Date();

    } else if (customerData["actionType"] === "purchase") {
      customerData["purchase_time"] = new Date();
    }
  }
}

const sendEventsToFacebookThroughConversionAPIWithoutScoring = async (req, res) => {

  const ipAddress = requestIp.getClientIp(req);
  const {
    savedScoreApiResponse,
    userId,
    eventSourceUrl,
    fbp,
    userAgent,
  } = JSON.parse(req.body)

  let fbData = []

  if (savedScoreApiResponse && savedScoreApiResponse.fbpid && savedScoreApiResponse.capito && fbp) {


    const audienceEvents = savedScoreApiResponse.audienceEvents ?? []


    audienceEvents.forEach(audienceEvent => {
      if (audienceEvent.adPlatform === "Facebook") {
        let eventData = {
          "event_name": audienceEvent.eventName,
          "event_id": audienceEvent.eventId,
          "event_time": parseInt(Date.now() / 1000),
          "action_source": "website",
          "event_source_url": eventSourceUrl,
          "user_data": {
            "fbp": fbp,
            "client_ip_address": ipAddress,
            "client_user_agent": userAgent
          }
        }

        if (fbc) {
          eventData.fbc = fbc
        }

        fbData.push(eventData);
      }
    })

    sendEventsToFacebookThroughConversionAPI({
      pixelId: savedScoreApiResponse.fbpid,
      accessToken: savedScoreApiResponse.capito,
      fbData,
      userId

    })
  }

  res.send({ message: "success", "eid": "" })

}

exports.upsertCustomer = upsertCustomer
exports.sendEventsToFacebookThroughConversionAPIWithoutScoring = sendEventsToFacebookThroughConversionAPIWithoutScoring
