const db = require("../models");
const UserModel = db.userModel;
const Mongoose = require("mongoose");

exports.getInfoForCustomer = async (req, res) => {
    const { userId } = req.params;

    const user = await UserModel.findOne(
        { _id: new Mongoose.Types.ObjectId(userId) },
        {
            'crmDetails.isBasicTracking': 1,
            'crmDetails.isAudienceNetworkEnabled': 1,
            'country': 1,
            'enhencerCategories': 1,
            'googleAds.conversionId': 1,

        },
    ).lean();

    if (!user) {
        return res.status(200).send({
            result: "error",
            message: "User not found",
        });
    }

    res.status(200).send({
        result: "success",
        isBasicTracking: user.crmDetails?.isBasicTracking ?? false,
        isAnEnabled: user.crmDetails?.isAudienceNetworkEnabled ?? false,
        country: user.country ?? "",
        categories: user.enhencerCategories ?? [],
        conversionId: user.googleAds?.conversionId ?? "",
    });
};