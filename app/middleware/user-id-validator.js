const userIdValidator = (req, res, next) => {
  // Only check for userID in body since it's already validated as JSON object
  // by the json-validator middleware which runs before this one
  if (!req.body.userID) {
    return res.status(200).send({
      success: true,
      message: "No user ID provided"
    });
  }

  // If userID exists, continue with the request
  next();
};

module.exports = userIdValidator; 