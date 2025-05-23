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

const redis = require('../config/redis');

exports.create = async (req, res) => {
  try {
    await upsertCustomer({ body: req.body });
    res.status(200).send({ result: "success" });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error occurred while creating customer"
    });
  }
}

const upsertCustomer = async ({ body }) => {
  try {
    const {
      visitorID,
      customerID,
      city,
      country,
      deviceType,
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
      userID, // or userId depending on your convention
    } = body;

    if (redis) {
      const missingCustomerTables = await redis.smembers('missing_customer_tables');
      if (missingCustomerTables && missingCustomerTables.includes(userID)) {
        return { message: "failure" };
      }
    }

    const customer = {
      visitorID,
      customerID,
      city,
      country,
      deviceType,
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
    };

    correctCustomerData(customer);
    Customer.tableName = "visitor_data_customer_" + userID;

    try {
      await Customer.upsert(customer);
      return { message: "success" };
    } catch (error) {
      if (redis && error.name === 'SequelizeDatabaseError' && error.parent?.code === 'ER_NO_SUCH_TABLE') {
        await redis.sadd('missing_customer_tables', userID);
      }
      throw error;
    }
  } catch (error) {
    console.error('Customer upsert error:', error);
    return error;
  }
};

// Update a Customer by the id in the request
exports.update = async (req, res) => {
  try {
    const ipAddress = requestIp.getClientIp(req);
    const visitorID = req.params.id;
    if (!visitorID || visitorID === 'undefined') {
      console.log(`[ALERT] Update attempted with invalid visitorID: '${visitorID}' - IP: ${ipAddress} - UserID: ${req.body?.userID} - Body:`, JSON.stringify(req.body));
      return res.status(200).send({
        result: "success",
        message: "No visitor ID or undefined ID provided"
      });
    }
    const {
      userID,
      fbp,
      fbc,
      userAgent,
      eventSourceUrl,
    } = req.body;

    let updatedData = {};
      let resultObject = {};
      let facebookAds = {};
      let enhencerCategories;

    try {
      const userAggregation = UserModel.aggregate([
        //This pipeline aims to retrieve user data matching userID
        { $match: { _id: new Mongoose.Types.ObjectId(userID) } },
        {
          $project: {
            token: 1,
            key: 1,
            percentage: 1,
            thresholds: 1,
            country: 1,
            'crmDetails.country': 1,
            'crmDetails.subscription': 1,
            'crmDetails.isAudienceNetworkEnabled': 1,
            'enhencerCategories': 1,
            'googleAds.conversionId': 1,
            'facebookAds': 1,
            'tiktokAds': 1
          },
        },
      ]);

      const user = await userAggregation.exec(); //get user data

      if (user.length === 0) {
        //if user does not exist

        return res.status(404).send({
          message: "No user or missing permissions."
        });

      } else if (!user[0].crmDetails || !user[0].crmDetails.subscription || user[0].crmDetails.subscription.status !== "Recurring" || user[0].crmDetails.subscription.isPaused === "Yes") {
        // if user status is not recurring

        return res.status(202).send({
          message: "not_recurring",
          anEnabled: user[0].crmDetails?.audienceNetworkSwitch,
          isAnEnabled: user[0].crmDetails?.isAudienceNetworkEnabled,
          enhencerCategories: user[0].enhencerCategories,
          country: user[0].country
        });

      } else if (!user[0].token && !user[0].key) {
        //if user is found but token and key are not found - no model

        resultObject["Likely to buy"] = -1;
        resultObject["Likely to buy segment"] = -1;

        resultObject["isAnEnabled"] = !!user[0].crmDetails && user[0].crmDetails.isAudienceNetworkEnabled
        let uniqId = Date.now().toString() + Math.floor(Math.random() * 10000).toString();
        let eventId = "eid." + uniqId.substring(5) + "." + visitorID;

        resultObject["campaigns"] = [
          {
            name: "enh_conv_rem",
            adPlatform: "Facebook",
            eventId: eventId,
          },
        ];
        updatedData = {
          score: null,
          enh_conv_rem: 1,
        };
      } else {
        // has model

        if (user[0].facebookAds) {
          facebookAds = user[0].facebookAds;
        }
        if (user[0].enhencerCategories) {
          enhencerCategories = user[0].enhencerCategories;
        }
        const token = user[0].token;
        const key = user[0].key;
        const bytes = CryptoJS.AES.decrypt(token, key);
        const idsJSON = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        let projectId = idsJSON.projectId;

        const matchQuery = {
          _id: new Mongoose.Types.ObjectId(projectId)
        };
        const projectQuery = {
          connectQuery: 1,
          campaigns: 1,
        };
        const aggregateQuery = [{ $match: matchQuery }, { $project: projectQuery }];
        const projectAggregation = ProjectModel.aggregate(aggregateQuery);
        const project = await projectAggregation.exec(); //get project data

        if (project.length === 0) {
          return res.send({ "message": "no project" });
        }

        const connectQuery = project[0].connectQuery;
        const campaigns = project[0].campaigns;
        const query = getQuery(connectQuery, userID, visitorID);
        
        const sqlQueryTimeLabel = `sql query time_${userID}_${Date.now()}`;
        const startTime = Date.now();
        console.time(sqlQueryTimeLabel);
        const queryResult = await sequelize.query(query, { raw: true, type: sequelize.QueryTypes.SELECT });
        console.timeEnd(sqlQueryTimeLabel);
        
        // Log slow queries (taking more than 2 seconds)
        const queryDuration = Date.now() - startTime;
        if (queryDuration > 2000) {
          console.log(`SLOW QUERY (${queryDuration}ms) for userID ${userID}:`, query);
        }
        
        if (!queryResult || queryResult.length === 0) {
          return res.send({ "message": "No result" });
        }
        const [customerData, metadata] = queryResult

        const modelsAggregation = ModelModel.aggregate([
          { $match: { $and: [{ userId: new Mongoose.Types.ObjectId(userID) }, { projectId: new Mongoose.Types.ObjectId(projectId) }] } },
          { $match: { current: true } },
          {
            $project: {
              _id: 1,
              name: 1,
              type: "$questionType",
              overallResult: "$overallResult",
              targetChoiceInfo: '$targetChoice',
              segmentsTree: 1
            }
          },
          { $sort: { _id: -1 } }
        ]);

        const timeLabel = `mongo modelsAggregation time_${userID}_${Date.now()}`;
        console.time(timeLabel);
        const models = await modelsAggregation.exec();
        console.timeEnd(timeLabel);
        const model = models[0];
        const isAudienceNetworkEnabled = !!user[0].crmDetails && user[0].crmDetails.isAudienceNetworkEnabled;
        resultObject = await createResultObject({
          userID,
          model,
          customerData,
          updatedData,
          campaigns,
          facebookAds,
          fbp: fbp,
          fbc,
          visitorId: visitorID,
          ipAddress: ipAddress,
          userAgent: userAgent,
          eventSourceUrl: eventSourceUrl,
          isAnEnabled: isAudienceNetworkEnabled,
          enhencerCategories: enhencerCategories
        });
        resultObject.isAnEnabled = isAudienceNetworkEnabled;
        if (user[0].tiktokAds) resultObject["tiktok"] = 1
      }



      resultObject.country = user[0].country;
      if (!resultObject.country || resultObject.country === "") {
        if (user[0].crmDetails) {
          resultObject.country = user[0].crmDetails.country;
        }
      }
      if (user[0].googleAds && user[0].googleAds.conversionId) {
        resultObject.conversionId = user[0].googleAds.conversionId;
      }

    } catch (error) {
      console.error('User aggregation error:', error);
      throw new Error('Failed to process user data');
    }

    Customer.tableName = "VISITOR_DATA_CUSTOMER_" + userID;

    const transaction = await Customer.sequelize.transaction();
    try {
      const selectedCustomer = await getById(visitorID);
      if (facebookAds.pixelId && facebookAds.accessToken) {
        await sendEventsToFacebookThroughConversionAPI({
          pixelId: facebookAds.pixelId,
          accessToken: facebookAds.accessToken,
          fbData: resultObject.fbData,
          userId: userID
        });
      }
      const { fbData, ...result } = resultObject;
      await selectedCustomer.update(updatedData, { transaction });
      await transaction.commit();
      return res.status(202).send(JSON.stringify(result));
    } catch (error) {
      await transaction.rollback();
      return res.status(200).send({
        message: error.message || "Error occured while scoring",
      });
    }

  } catch (error) {
    return res.status(200).send({
      message: "Failed to process user data",
      error: error.message || "Unknown error occurred"
    });
  }
};

function getQuery(connectQuery, userId, id) {
  const visitorDataCustomerTable = "VISITOR_DATA_CUSTOMER_" + userId;
  const visitorDataProductTable = "VISITOR_DATA_PRODUCT_" + userId;
  const visitorDataListingTable = "VISITOR_DATA_LISTING_" + userId;

  let index = connectQuery.indexOf("FROM " + visitorDataCustomerTable);
  let query = connectQuery.slice(0, index) + "FROM " + visitorDataCustomerTable + " WHERE visitorID = " + "'" + id + "' " + connectQuery.slice(index).replace("FROM " + visitorDataCustomerTable + " WHERE visitorID = ", "");

  index = query.indexOf("FROM " + visitorDataProductTable);
  query = query.slice(0, index) + "FROM " + visitorDataProductTable + " WHERE visitorID = " + "'" + id + "' " + query.slice(index).replace("FROM " + visitorDataProductTable, "");

  index = query.indexOf("FROM " + visitorDataListingTable);
  query = query.slice(0, index) + "FROM " + visitorDataListingTable + " WHERE visitorID = " + "'" + id + "' " + query.slice(index).replace("FROM " + visitorDataListingTable, "");
  return query;
}



async function createResultObject({ userID, model, customerData, updatedData, campaigns, facebookAds, fbp, fbc,
  visitorId, ipAddress, userAgent, eventSourceUrl, isAnEnabled, enhencerCategories }) {
  let resultObject = {
    "Uplift": 1,
    "Likely to buy": model.overallResult,
    "Likely to buy segment": null,
    "campaigns": [],
    "fbData": [],
    capito: facebookAds.accessToken,
    fbpid: facebookAds.pixelId
  };
  if (customerData) {
    calculateCustomerScores(resultObject, model, customerData, updatedData);
    setEnhencerCampaignEvents(resultObject, customerData, updatedData, campaigns, facebookAds, fbp, fbc, visitorId, ipAddress, userAgent, eventSourceUrl);

    if (isAnEnabled && enhencerCategories && model.overallResult !== 0) {
      resultObject.enhencerCategories = enhencerCategories.toString();
    }
  }
  return resultObject;
}

function calculateCustomerScores(scoreObject, model, customerData, updatedData) {
  let counter = 0;
  for (let segmentIndex = 0; segmentIndex < model.segmentsTree.length; segmentIndex++) {
    const segment = model.segmentsTree[segmentIndex];
    for (let branchIndex = 0; branchIndex < segment.tree.length; branchIndex++) {
      const branch = segment.tree[branchIndex];
      if (branch.type !== 1) {
        if (branch.label !== "Overall") {
          if (branch.description in customerData) {
            if (branch.choiceDescriptionList.indexOf(customerData[branch.description].toString()) > -1) {
              counter++;
            }
          } else {
            if (branch.choiceDescriptionList.indexOf("Missing") > -1) {
              counter++;
            }
          }
        }
      } else {
        if (branch.label !== "Overall") {
          if (branch.description in customerData) {
            const value = parseFloat(branch.choicePart);
            switch (branch.comparisonPart) {
              case "<=":
                if (customerData[branch.description] <= value) {
                  counter++;
                }
                break;
              case ">=":
                if (customerData[branch.description] >= value) {
                  counter++;
                }
                break;
              case "<":
                if (customerData[branch.description] < value) {
                  counter++;
                }
                break;
              case ">":
                if (customerData[branch.description] > value) {
                  counter++;
                }
                break;
              default:
            }
          } else {
            if (branch.choiceDescriptionList.indexOf("Missing") > -1) {
              counter++;
            }
          }
        }
      }
    }
    if (counter === segment.tree.length - 1) {
      let score;
      if (model.type === 4) {
        const branchPredictionList = segment.tree[0].prediction;
        const index = model.targetChoiceInfo.currentIndex;
        score = branchPredictionList[index];
        scoreObject["Likely to buy"] = score;
        scoreObject["Likely to buy segment"] = segmentIndex + 1;
        scoreObject["Uplift"] = score / model.overallResult;
        updatedData["purchase_propensity"] = score;
        updatedData["segment"] = segmentIndex + 1;
        return scoreObject;
      } else {
        score = segment.tree[0].prediction[0];
        scoreObject["Expected average order"] = score;
        scoreObject["Average order segment"] = segmentIndex + 1;
        return scoreObject;
      }
    }
    counter = 0;
  }
}

function setEnhencerCampaignEvents(resultObject, customerData, updatedData, campaigns, facebookAds, fbp, fbc, visitorId, ipAddress, userAgent, eventSourceUrl) {
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
              "client_ip_address": ipAddress,
              "client_user_agent": userAgent
            }
          }

          if (fbc) {
            eventData.user_data.fbc = fbc
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

  if (fbData && fbData.length > 0) {
    let url = `https://graph.facebook.com/v20.0/${pixelId}/events?access_token=${accessToken}`
    try {
      const fbResult = await axios.post(url, {
        data: fbData
      })
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
  ['city', 'country', 'deviceType'].forEach(field => {
    customerData[field] = customerData[field] === undefined || customerData[field] === "undefined" ? "" : customerData[field];
  });

  if (customerData.source) {
    customerData.source = customerData.source.substring(0, 120);
  }

  const actionMap = {
    'product': { product_viewer: 1, last_product_view_time: new Date() },
    'basket': { add_to_basket: 1, last_add_to_basket_time: new Date() },
    'purchase': { purchase_time: new Date() }
  };

  if (customerData.actionType && actionMap[customerData.actionType]) {
    Object.assign(customerData, actionMap[customerData.actionType]);
  }
}

const sendEventsToFacebookThroughConversionAPIWithoutScoring = async (req, res) => {

  const ipAddress = requestIp.getClientIp(req);
  const {
    savedScoreApiResponse,
    userId,
    eventSourceUrl,
    fbp,
    fbc,
    userAgent,
  } = req.body

  let fbData = []

  if (savedScoreApiResponse && savedScoreApiResponse.fbpid && savedScoreApiResponse.capito && fbp) {

    const campaignsEvents = savedScoreApiResponse.campaigns

    let finalEventsList = campaignsEvents ?? []
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
          eventData.user_data.fbc = fbc
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
