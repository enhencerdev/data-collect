const db = require("../models");
const CryptoJS = require("crypto-js");
const axios = require('axios');
const requestIp = require('request-ip');
const Customer = db.customers;
const Mongoose = db.Mongoose;
const sequelize = db.sequelize;
const PurchaseUserSchema = db.purchaseUserSchema;
const UserModel = db.userModel;
const ProjectModel = db.projectModel;
const ModelModel = db.modelModel;
const FacebookLogModel = db.facebookLogModel;

exports.create = async (req, res) => {
  upsertCustomer({ body: req.body })
  res.status(200).send({ result: "success" });
}


const upsertCustomer = async ({ body }) => {

  const {
    userID,
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
  Customer.tableName = "visitor_data_customer_" + userID;

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
    userID,
    city,
    country,
    deviceType,
    add_to_basket,
    last_add_to_basket_time,
    product_viewer,
    last_product_view_time,
    purchase_time,
    source,
    fbp,
    userAgent,
    eventSourceUrl,
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
  } = JSON.parse(req.body);

  const customer = {
    visitorID,
    customerID,
    userID,
    city,
    country,
    deviceType,
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

  let updatedData = {};
  let resultObject = {};
  let facebookAds = {};
  let enhencerCategories;

  //creates a Mongoose model. Collection name is 'purchase_users', schema is 'PurchaseUserSchema', model name is 'user'
  /* const UserModel = mongoose.model(
    "user",
    PurchaseUserSchema,
    "purchase_users"
  );
  const ProjectModel = mongoose.model(
    "project",
    PurchaseProjectSchema,
    "projects"
  ); */


  console.log("start ", userID)
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
          'crmDetails.audienceNetworkSwitch': 1,
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
      res.status(404).send({
        message: "No user"
      });

      return { message: "no user" };

    } else if (!user[0].token && !user[0].key) {
      console.log("------??????? 1 ", userID)
      //if user is found but token and key are not found - no model
      resultObject["Likely to buy"] = -1;
      resultObject["Likely to buy segment"] = -1;

      resultObject["anEnabled"] = !!user[0].crmDetails && user[0].crmDetails.audienceNetworkSwitch
      resultObject["isAnEnabled"] = !!user[0].crmDetails && user[0].crmDetails.isAudienceNetworkEnabled
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
      console.log("------??????? 2 ", userID)
    } else {
      console.log("------??????? 3 ", userID)
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
        audiences: 1,
        campaigns: 1,
      };
      console.log("------??????? 4 ", userID)
      const aggregateQuery = [{ $match: matchQuery }, { $project: projectQuery }];
      const projectAggregation = ProjectModel.aggregate(aggregateQuery);
      const project = await projectAggregation.exec(); //get project data
      if (project.length === 0) return { "message": "no project" };
      const connectQuery = project[0].connectQuery;
      const audiences = project[0].audiences;
      const campaigns = project[0].campaigns;
      const query = getQuery(connectQuery, userID, visitorID);
      const [customerData, metadata] = await sequelize.query(query, { raw: true, type: sequelize.QueryTypes.SELECT });
      // const ModelModel = mongoose.model('model', PurchaseModelSchema, 'models');
      console.log("------??????? 5 ", userID)
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
      const models = await modelsAggregation.exec();
      const model = models[0];
      const audienceNetworkEnabled = !!user[0].crmDetails && user[0].crmDetails.audienceNetworkSwitch;
      const isAudienceNetworkEnabled = !!user[0].crmDetails && user[0].crmDetails.isAudienceNetworkEnabled;
      console.log("------??????? 6 ", userID)
      resultObject = await createResultObject({
        userID, model, customerData, updatedData, audiences, campaigns, facebookAds,
        fbp: fbp,
        visitorId: visitorID,
        ipAddress: ipAddress,
        userAgent: userAgent,
        eventSourceUrl: eventSourceUrl,
        anEnabled: audienceNetworkEnabled,
        isAnEnabled: isAudienceNetworkEnabled,
        enhencerCategories: enhencerCategories
      });
      resultObject.anEnabled = audienceNetworkEnabled;
      resultObject.isAnEnabled = isAudienceNetworkEnabled;
      if (user[0].tiktokAds) resultObject["tiktok"] = 1

      console.log("------??????? 7 ", userID)
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


    console.log("------??????? 8 ", userID)
  } catch (error) {
    console.log("------??????? 9 ", userID, error)
    res.status(500).send({
      message:
        error.message || "Some error occurred while creating the Customer.",
    });
  }

  Customer.tableName = "VISITOR_DATA_CUSTOMER_" + userID;

  const transaction = await Customer.sequelize.transaction();
  try {
    console.log("------??????? 10 ", userID)
    const selectedCustomer = await getById(visitorID);
    await sendEventsToFacebookThroughConversionAPI({
      pixelId: facebookAds.pixelId,
      accessToken: facebookAds.accessToken,
      fbData: resultObject.fbData,
      userId: userID
    });
    console.log("------??????? 11 ", userID)
    const { fbData, ...result } = resultObject;
    await selectedCustomer.update(updatedData, { transaction });
    await transaction.commit();
    console.log("------??????? 22 ", userID)
    res.status(202).send(JSON.stringify(result));
    return result;
  } catch (error) {
    console.log("------??????? 33 ", userID)
    await transaction.rollback();
    console.log("------??????? 44 ", userID)
    res.status(200).send({
      message:
        error.message || "Error occured while scoring",
    });
    return
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



async function createResultObject({ userID, model, customerData, updatedData, audiences, campaigns, facebookAds, fbp,
  visitorId, ipAddress, userAgent, eventSourceUrl, anEnabled, isAnEnabled, enhencerCategories }) {
  let resultObject = {
    "Uplift": 1,
    "Likely to buy": model.overallResult,
    "Likely to buy segment": null,
    "audiences": [],
    "campaigns": [],
    "fbData": []
  };
  if (customerData) {
    calculateCustomerScores(resultObject, model, customerData, updatedData);
    setEnhencerAudiences(resultObject, customerData, updatedData, audiences, facebookAds, fbp, visitorId, ipAddress, userAgent, eventSourceUrl);
    setEnhencerCampaignAudiences(resultObject, customerData, updatedData, campaigns, facebookAds, fbp, visitorId, ipAddress, userAgent, eventSourceUrl);


    // isAnEnabled is a flag for new audience network structure
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
            // bug may occur because of toString check!!!
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


function setEnhencerAudiences(resultObject, customerData, updatedData, audiences, facebookAds, fbp, visitorId, ipAddress, userAgent, eventSourceUrl) {
  const now = Date.now();
  const lastEditedAt = new Date(customerData["Last Edited At"]);
  const activeDayCount = (now - lastEditedAt.getTime()) / (1000 * 3600 * 24);

  const purchased = customerData["purchase_time"];
  const purchasedAt = new Date(purchased);
  const purchaseDayCount = (now - purchasedAt.getTime()) / (1000 * 3600 * 24);

  const addToBasketAction = customerData["last_add_to_basket_time"];
  const addToBasketActionAt = new Date(addToBasketAction);
  const addToBasketActionDayCount = (now - addToBasketActionAt.getTime()) / (1000 * 3600 * 24);

  let isEnhencerAudience;
  audiences.forEach(function (audience) {
    isEnhencerAudience = 0;
    if (audience.selectedSegmentNos.indexOf(resultObject["Likely to buy segment"]) > -1 && activeDayCount <= audience.day) {
      if (audience.includePurchased === false) {
        if (purchased === null || purchaseDayCount > 3) {
          if (filterCategories(customerData, audience.selectedCategories) === true) {
            isEnhencerAudience = 1;
          }
        }
      } else {
        if (filterCategories(customerData, audience.selectedCategories) === true) {
          isEnhencerAudience = 1;
        }
      }
    } else {
      if (audience.includeAddtoBasket === true) {
        if (addToBasketActionDayCount <= 31) {
          if (filterCategories(customerData, audience.selectedCategories) === true) {
            isEnhencerAudience = 1;
          }
        }
      }
    }

    if (isEnhencerAudience) {
      if (facebookAds && facebookAds.pixelId && facebookAds.accessToken && fbp && audience.platform === "Facebook") {
        const uniqId = Date.now().toString() + Math.floor(Math.random() * 10000).toString();
        const eventId = "eid." + uniqId.substring(5) + "." + visitorId;
        resultObject.audiences.push({
          "name": audience.name,
          "adPlatform": audience.platform,
          "eventId": eventId,
        });
        resultObject.fbData.push({
          "event_name": audience.name,
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
        });
      } else {
        resultObject.audiences.push({
          "name": audience.name,
          "adPlatform": audience.platform,
        });
      }
      updatedData[audience.path] = 1;
    } else {
      updatedData[audience.path] = 0;
    }
  });
}


function setEnhencerCampaignAudiences(resultObject, customerData, updatedData, campaigns, facebookAds, fbp, visitorId, ipAddress, userAgent, eventSourceUrl) {
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
          resultObject.fbData.push({
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
          });
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
    let url = `https://graph.facebook.com/v15.0/${pixelId}/events?access_token=${accessToken}`
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

exports.upsertCustomer = upsertCustomer