const db = require("../models");
const userModel = db.userModel;
const Mongoose = require("mongoose");

exports.getInfoForCustomer = async (req, res) => {
    const { userId } = req.params;

    const user = await userModel.findOne(
        { _id: new Mongoose.Types.ObjectId(userId) },
        {
            'crmDetails.isBasicTracking': 1,
            'crmDetails.isAudienceNetworkEnabled': 1,
            'country': 1,
            'enhencerCategories': 1,
            'googleAds.conversionId': 1,

        },
    ).lean();

    res.status(200).send({
        result: "success",
        isBasicTracking: user.crmDetails?.isBasicTracking ?? false,
        isAnEnabled: user.crmDetails?.isAudienceNetworkEnabled ?? false,
        country: user.country ?? "",
        categories: user.enhencerCategories ?? [],
        conversionId: user.googleAds?.conversionId ?? "",
    });
};