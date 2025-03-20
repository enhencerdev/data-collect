const UserModel = require("../models/nosql/user.model");

exports.getInfoForCustomer = async (req, res) => {
    const { userId } = req.params;

    const user = await UserModel.findOne(
        { _id: new Mongoose.Types.ObjectId(userId) },
        {
            'crmDetails.isBasicUser': 1,
            'crmDetails.isAudienceNetworkEnabled': 1,
            'country': 1,
            'enhencerCategories': 1,
            'googleAds.conversionId': 1,

        },
    ).lean();

    res.status(200).send({
        result: "success",
        isBasicUser: user.crmDetails?.isBasicUser ?? false,
        isAnEnabled: user.crmDetails?.isAudienceNetworkEnabled ?? false,
        country: user.country ?? "",
        categories: user.enhencerCategories ?? [],
        conversionId: user.googleAds?.conversionId ?? "",
    });
};