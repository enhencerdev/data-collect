const db = require("../models");
const CryptoJS = require("crypto-js");
const Customer = db.customers;
//const Op = db.Sequelize.Op;
const mongoose = db.mongoose;
const Mongoose = db.Mongoose;
const sequelize = db.sequelize;

const PurchaseUserSchema = require("../models/nosql/purchaseUser.model");
const PurchaseProjectSchema = require("../models/nosql/purchaseProject.model");
const PurchaseModelSchema = require("../models/nosql/purchaseModel.model");

function updateCustomerData(customerData) {
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

exports.create = async (req, res) => {
  // Validate request
  /*if (!req.body.title) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }*/

  // Create a Customer
  const {
    visitorID,
    customerID,
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
  } = req.body;

  const customer = {
    visitorID,
    customerID,
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

  // Update customer data
  updateCustomerData(customer);

  // Set table name
  Customer.tableName = "visitor_data_customer_" + req.body.userID;

  // Save Customer in the database
  try {
    const createdCustomer = await Customer.upsert(customer);
    res.status(200).send({ result: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message:
        error.message || "Some error occurred while creating the Customer.",
    });
  }
};

// Update a Customer by the id in the request
exports.update = async (req, res) => {
  const {
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
  } = req.body;

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

  //creates a Mongoose model. Collection name is 'purchase_users', schema is 'PurchaseUserSchema', model name is 'user'
  const UserModel = mongoose.model(
    "user",
    PurchaseUserSchema,
    "purchase_users"
  );
  const ProjectModel = mongoose.model(
    "project",
    PurchaseProjectSchema,
    "projects"
  );

  try {
    const userAggregation = UserModel.aggregate([
      //This pipeline aims to retrieve user data matching userID
      { $match: { _id: new Mongoose.Types.ObjectId(userID) } },
      {
        $project: {
          token: 1,
          key: 1,
          perventage: 1,
          tresholds: 1,
          "crmDetails.audienceNetworkSwitch": 1,
          "googleAds.conversionId": 1,
          facebookAds: 1,
        },
      },
    ]);

    const user = await userAggregation.exec(); //get user data

    if (user.length === 0)
      return { message: "no user" }; //if user does not exist
    else if (!user[0].token && !user[0].key) {
      //if user is found but token and key are not found
      resultObject["Likely to buy"] = -1;
      resultObject["Likely to buy segment"] = -1;
      let uniqId =
        Date.now().toString() + +Math.floor(Math.random() * 10000).toString();
      let eventId = "eid." + uniqId.substring(5) + "." + visitorID;
      resultObject["audiences"] = [
        {
          name: "Enhencer Audience 1",
          adPlatform: "Facebook",
          eventId: eventId,
        },
      ];
      uniqId =
        Date.now().toString() + +Math.floor(Math.random() * 10000).toString();
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

      if (user[0].facebookAds) {
        facebookAds = user[0].facebookAds;
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
      const aggregateQuery = [{ $match: matchQuery }, { $project: projectQuery }]; 
      const projectAggregation = ProjectModel.aggregate(aggregateQuery);
      const project = await projectAggregation.exec(); //get project data
      if (project.length === 0) return { "message": "no project" };
      const connectQuery = project[0].connectQuery;
      const audiences = project[0].audiences;
      const campaigns = project[0].campaigns;
      const query = getQuery(connectQuery, userID, visitorID);
      const [customerData, metadata] = await sequelize.query(query, { raw: true, type: sequelize.QueryTypes.SELECT });
      const ModelModel = mongoose.model('model', PurchaseModelSchema, 'models');
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
        resultObject = createResultObject(model, customerData, updatedData, audiences, campaigns, facebookAds,
          customer.fbp, customer.visitorID, customer.userAgent, customer.eventSourceUrl);
      
    }

    if (user[0].googleAds && user[0].googleAds.conversionId) {
      resultObject.conversionId = user[0].googleAds.conversionId;
    }

    if (user[0].crmDetails && user[0].crmDetails.audienceNetworkSwitch && user[0].crmDetails.audienceNetworkSwitch === "on") {
      resultObject.anEnabled = 1;
    }
    

  } catch (error) {
    console.log(error);
    res.status(500).send({
      message:
        error.message || "Some error occurred while creating the Visitor.",
    });
  }

  Customer.tableName = "VISITOR_DATA_CUSTOMER_" + userID;
  const selectedCustomer = await _getById(visitorID);

  const transaction = await Customer.sequelize.transaction();

  try {
    await sendEventsToFacebookThroughConversionAPI(facebookAds.pixelId, facebookAds.accessToken, resultObject.fbData, userID);
    const { fbData, ...result } = resultObject;
    console.log("UPDATED DATA: ", updatedData)
    await selectedCustomer.update(updatedData, { transaction });
    await transaction.commit();
    res.status(200).send(result);
    return result;
  } catch (error) {
    console.log( error)
    await transaction.rollback();
    throw error;
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


function createResultObject(model, customerData, updatedData, audiences, campaigns, facebookAds, fbp, visitorId, userAgent, eventSourceUrl) {
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
    setEnhencerAudiences(resultObject, customerData, updatedData, audiences, facebookAds, fbp, visitorId, userAgent, eventSourceUrl);
    setEnhencerCampaignAudiences(resultObject, customerData, updatedData, campaigns, facebookAds, fbp, visitorId, userAgent, eventSourceUrl);
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


function setEnhencerAudiences(resultObject, customerData, updatedData, audiences, facebookAds, fbp, visitorId, userAgent, eventSourceUrl) {
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
        const uniqId = Date.now().toString() + + Math.floor(Math.random() * 10000).toString();
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


function setEnhencerCampaignAudiences(resultObject, customerData, updatedData, campaigns, facebookAds, fbp, visitorId, userAgent, eventSourceUrl) {
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
          const uniqId = Date.now().toString() + + Math.floor(Math.random() * 10000).toString();
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

const _getById = async function(visitorId) {
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

const sendEventsToFacebookThroughConversionAPI = async function(pixelId, accessToken, fbData, userId) {
  if (fbData && fbData.length > 0) {
    let url = `https://graph.facebook.com/v15.0/${pixelId}/events?access_token=${accessToken}`
    try {
      const fbResult = await axios.post(url, {
        data: fbData
      })
      return;
    } catch (err) {

      const FacebookLogModel = this.mongoose.model('facebook_log', this.FacebookLogSchema, 'facebook_logs');
      FacebookLogModel.create({
        error: err,
        userId: userId,
      });
      return;
    }
  } else {
    return;
  }
}
