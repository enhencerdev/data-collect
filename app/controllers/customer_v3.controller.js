const db = require("../models");
const CryptoJS = require("crypto-js");
const axios = require('axios');
const requestIp = require('request-ip');
const Customer = db.customers;
const Mongoose = db.Mongoose;
const sequelize = db.sequelize;
const UserModel = db.userModel;
const ProjectModel = db.projectModel;
const ModelModel = db.modelModel;

exports.create = async (req, res) => {
  upsertCustomer({ body: req.body })
  res.status(200).send({ result: "success" });
}


const upsertCustomer = async ({ body }) => {

  const {
    userId,
    visitorID,
    customerID,
    city,
    country,
    deviceType,
    scrollPercentage,
    searched,
    sessionDuration,
    actionType,
    add_to_basket,
    last_add_to_basket_time,
    product_viewer,
    last_product_view_time,
    purchase_time,
    source,
    purchase_propensity,
    segment,
    expected_revenue,
    revenue_segment,
    score,
    enhencer_audience,
    b_audience,
    enh_conv_rem,
    enh_dpa_rem,
    enh_gdn_rem,
    enh_conv_high_intent_rem,
    enh_dpa_high_intent_rem,
    enh_perf_max_rem,
    enh_search_rem,
    enh_rlsa_rem,
    enh_conv_lal,
    enh_dpa_lal,
    enh_traffic_lal,
    enhencer_audience_1,
    enhencer_audience_2,
    enhencer_audience_3,
    enhencer_audience_4,
    enhencer_audience_5,
  } = JSON.parse(body);

  const customer = {
    visitorID,
    customerID,
    city,
    country,
    deviceType,
    scrollPercentage,
    searched,
    sessionDuration,
    actionType,
    add_to_basket,
    last_add_to_basket_time,
    product_viewer,
    last_product_view_time,
    purchase_time,
    source,
    purchase_propensity,
    segment,
    expected_revenue,
    revenue_segment,
    score,
    enhencer_audience,
    b_audience,
    enh_conv_rem,
    enh_dpa_rem,
    enh_gdn_rem,
    enh_conv_high_intent_rem,
    enh_dpa_high_intent_rem,
    enh_perf_max_rem,
    enh_search_rem,
    enh_rlsa_rem,
    enh_conv_lal,
    enh_dpa_lal,
    enh_traffic_lal,
    enhencer_audience_1,
    enhencer_audience_2,
    enhencer_audience_3,
    enhencer_audience_4,
    enhencer_audience_5,
  };

  // Update customer data
  correctCustomerData(customer);

  // Set table name
  Customer.tableName = "visitor_data_customer_" + userId;

  // Save Customer in the database
  try {
    const createdCustomer = await Customer.upsert(customer);
    return "success"
  } catch (error) {
    console.log(error);
    return error
  }
};

// Update a Customer by the id in the request
exports.update = async (req, res) => {
  const ipAddress = requestIp.getClientIp(req);
  const {
    visitorID = req.params.id,
    customerID,
    userId,
    city,
    country,
    deviceType,
    scrollPercentage,
    searched,
    sessionDuration,
    add_to_basket,
    last_add_to_basket_time,
    product_viewer,
    last_product_view_time,
    purchase_time,
    source,
    fbp,
    fbc,
    userAgent,
    eventSourceUrl,
  } = JSON.parse(req.body);

  let updatedData = {};
  let resultObject = {};
  let facebookAds = {};
  let enhencerCategories;

  const bignessCoefficient = 0.6


  console.log("start ", userId)
  try {
    const user = await UserModel.findOne(
      { _id: new Mongoose.Types.ObjectId(userId) },
      {
        country: 1,
        'crmDetails.country': 1,
        'crmDetails.subscription': 1,
        'crmDetails.audienceNetworkSwitch': 1,
        'crmDetails.isAudienceNetworkEnabled': 1,
        'enhencerCategories': 1,
        'googleAds.conversionId': 1,
        'facebookAds': 1,
        'tiktokAds': 1,
      },
    ).lean();

    if (!user) {
      //if user does not exist

      res.status(404).send({
        message: "No user or missing permissions."
      });

      return { message: "no user" };

    } else if (!user.crmDetails || !user.crmDetails.subscription || user.crmDetails.subscription.status !== "Recurring") {
      //if user status is not recurring
      res.status(404).send({
        message: "Missing permissions."
      });

      return { message: "missing permissions" };

      } else if (!user.token && !user.key) {
    // } else if (false) {

      //if user is found but token and key are not found - no model
      if (bignessCoefficient < 0.5) {

        resultObject["Likely to buy"] = -1;
        resultObject["Likely to buy segment"] = -1;
  
        resultObject["anEnabled"] = !!user.crmDetails && user.crmDetails.audienceNetworkSwitch
        resultObject["isAnEnabled"] = !!user.crmDetails && user.crmDetails.isAudienceNetworkEnabled
  
        let uniqId = Date.now().toString() + Math.floor(Math.random() * 10000).toString();
        let eventId = "eid." + uniqId.substring(5) + "." + visitorID;
  
        resultObject["audiences"] = [
          {
            name: "Enhencer Audience 1",
            adPlatform: "Facebook",
            eventId: eventId,
          },
        ];
        uniqId = Date.now().toString() + Math.floor(Math.random() * 10000).toString();
        eventId = "eid." + uniqId.substring(5) + "." + visitorID;
        resultObject["campaigns"] = [
          {
            name: "enh_conv_rem",
            adPlatform: "Facebook",
            eventId: eventId,
          },
        ];
        updatedData = {
          score: null,
          enhencer_audience_1: 1,
          enh_conv_rem: 1,
        };
      } else {
        return {
          message: "Wait",
          bc: bignessCoefficient
        }
      }

    } else {

      // has model
      if (user.facebookAds) {
        facebookAds = user.facebookAds;
      }
      if (user.enhencerCategories) {
        enhencerCategories = user.enhencerCategories;
      }
      /* const token = user.token;
      const key = user.key;
      const bytes = CryptoJS.AES.decrypt(token, key);
      const idsJSON = JSON.parse(bytes.toString(CryptoJS.enc.Utf8)); */


      console.log("before it")
      const project = await ProjectModel.findOne({
        userId: new Mongoose.Types.ObjectId(userId)
      },
        {
          "audienceModel.dataPrepQuery": 1
        }).lean()


      if (!project) {
        console.log("no projectttetetetete")
        // return res.send({ "message": "no project" });
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

      const audienceNetworkEnabled = !!user.crmDetails && user.crmDetails.audienceNetworkSwitch;
      const isAudienceNetworkEnabled = !!user.crmDetails && user.crmDetails.isAudienceNetworkEnabled;

      let resultObject = {
        "Uplift": 1,
        "Likely to buy": 1, //model.overallResult,
        "Likely to buy segment": null,
        "audiences": [],
        "campaigns": [],
        "fbData": [],
        capito: facebookAds.accessToken,
        fbpid: facebookAds.pixelId
      };

      if (customerData) {
        let score = await scoreRandomForest({
          userId,
          customerData
        })

        resultObject.score = score

        // isAnEnabled is a flag for new audience network structure
        if (isAudienceNetworkEnabled && enhencerCategories && model.overallResult !== 0) {
          resultObject.enhencerCategories = enhencerCategories.toString();
        }
      }


      resultObject.anEnabled = audienceNetworkEnabled;
      resultObject.isAnEnabled = isAudienceNetworkEnabled;
      if (user.tiktokAds) resultObject["tiktok"] = 1

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


  } catch (error) {
    res.status(500).send({
      message:
        error.message || "Some error occurred while creating the Customer.",
    });
  }
  return res.send("yessss")

  Customer.tableName = "VISITOR_DATA_CUSTOMER_" + userId;

  const transaction = await Customer.sequelize.transaction();
  try {

    const selectedCustomer = await getById(visitorID);
    if (facebookAds.pixelId && facebookAds.accessToken) {
      await sendEventsToFacebookThroughConversionAPI({
        pixelId: facebookAds.pixelId,
        accessToken: facebookAds.accessToken,
        fbData: resultObject.fbData,
        userId: userId
      });
    }

    const { fbData, ...result } = resultObject;

    res.status(202).send(JSON.stringify(result));
    return result;
  } catch (error) {

    await transaction.rollback();

    res.status(200).send({
      message:
        error.message || "Error occured while scoring",
    });
    return
  }

};

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

  console.log(">>>>>> will score customer")
  console.log(customerData)

  try {
    const scoreResult = await axios.post("http://localhost:8002/score", {
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

function setEnhencerCampaignAudiences(resultObject, customerData, updatedData, campaigns, facebookAds, fbp, fbc, visitorId, ipAddress, userAgent, eventSourceUrl) {
  const now = Date.now();
  const lastEditedAt = new Date(customerData["Last Edited At"]);
  const activeDayCount = (now - lastEditedAt.getTime()) / (1000 * 3600 * 24);

  const purchased = customerData["purchase_time"];
  const purchasedAt = new Date(purchased);
  const purchaseDayCount = (now - purchasedAt.getTime()) / (1000 * 3600 * 24);

  const addToBasketAction = customerData["last_add_to_basket_time"];
  const addToBasketActionAt = new Date(addToBasketAction);
  const addToBasketActionDayCount = (now - addToBasketActionAt.getTime()) / (1000 * 3600 * 24);


  let camp;
  let isEnhencerAudience;
  let audience;
  let bundles;
  let day;
  campaigns.forEach(function (campaign) {
    isEnhencerAudience = 0;
    audience = campaign.audience;
    bundles = [];
    if (audience.selectedSegmentNos) {
      day = audience.day ? audience.day : 31;
      if (audience.selectedSegmentNos.indexOf(resultObject["Likely to buy segment"]) > -1 && activeDayCount <= day) {
        if (audience.includePurchased === false) {
          if (purchased === null || purchaseDayCount > 3) {
            isEnhencerAudience = 1;
          }
        } else {
          isEnhencerAudience = 1;
        }
      } else {
        if (audience.includeAddtoBasket === true) {
          if (addToBasketActionDayCount <= 31) {
            isEnhencerAudience = 1;
          }
        }
      }

      if (isEnhencerAudience) {
        bundles = createFilterCategories(customerData, campaign.filterBundles);
        if (facebookAds && facebookAds.pixelId && facebookAds.accessToken && fbp && campaign.adPlatform === "Facebook") {
          const uniqId = Date.now().toString() + Math.floor(Math.random() * 10000).toString();
          const eventId = "eid." + uniqId.substring(5) + "." + visitorId;
          camp = {
            "name": campaign.audiencePath,
            "adPlatform": campaign.adPlatform,
            "eventId": eventId,
          };
          if (bundles.length > 0) {
            camp["bundles"] = bundles
          }
          resultObject.campaigns.push(camp);

          let eventData = {
            "event_name": campaign.audiencePath,
            "event_id": eventId,
            "event_time": parseInt(Date.now() / 1000),
            "action_source": "website",
            "event_source_url": eventSourceUrl,
            "user_data": {
              "fbp": fbp,
              //"external_id": visitorId,
              "client_ip_address": ipAddress,
              "client_user_agent": userAgent
            }
          }

          if (fbc) {
            eventData.fbc = fbc
          }

          resultObject.fbData.push(eventData);
        } else {
          camp = {
            "name": campaign.audiencePath,
            "adPlatform": campaign.adPlatform,
          };
          if (bundles.length > 0) {
            camp["bundles"] = bundles
          }
          resultObject.campaigns.push(camp);
        }
        updatedData[campaign["audiencePath"]] = 1;
      } else {
        updatedData[campaign["audiencePath"]] = 0;
      }
    }
  });
}

function filterCategories(customerData, categories) {
  let count = 0;
  let categoryName;
  if (!categories || categories.length === 0) {
    return true;
  }
  for (let category of categories) {
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
  return count !== 0 ? true : false;
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

async function getById(visitorId) {
  try {
    return await Customer.findById(visitorId, { rejectOnEmpty: true });

  } catch (error) {
    if (error.name === 'SequelizeEmptyResultError') {
      const notFoundError = new Error('NotFoundError');
      notFoundError.details = `Customer with visitorId ${visitorId} can't be found.`;

      throw notFoundError;
    }

    throw error;
  }
}

async function sendEventsToFacebookThroughConversionAPI({
  pixelId,
  accessToken,
  fbData,
  userId
}) {
  console.log("sendEventsToFacebookThroughConversionAPI for userId", fbData)
  console.log("pixel id: ", pixelId, ", accessToken: ", accessToken)

  if (fbData && fbData.length > 0) {
    console.log("inside")
    let url = `https://graph.facebook.com/v20.0/${pixelId}/events?access_token=${accessToken}`
    try {
      const fbResult = await axios.post(url, {
        data: fbData
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
  customerData["city"] =
    customerData["city"] === undefined || customerData["city"] === "undefined"
      ? ""
      : customerData["city"];
  customerData["country"] =
    customerData["country"] === undefined ||
      customerData["country"] === "undefined"
      ? ""
      : customerData["country"];
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
      customerData["product_viewer"] = 1;
      customerData["last_product_view_time"] = new Date();
    } else if (customerData["actionType"] === "basket") {
      customerData["add_to_basket"] = 1;
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

    const campaignsEvents = savedScoreApiResponse.campaigns
    const audienceEvents = savedScoreApiResponse.audiences


    let finalEventsList = (campaignsEvents ?? []).concat(audienceEvents ?? [])
    finalEventsList.forEach(event => {
      if (event.adPlatform === "Facebook") {
        let eventData = {
          "event_name": event.name,
          "event_id": event.eventId,
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
