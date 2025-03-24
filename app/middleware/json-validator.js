const jsonValidator = (req, res, next) => {
  try {
    // Ensure body is a string
    if (typeof req.body !== 'string') {
      return res.status(400).send({
        message: "Request body must be stringified JSON",
        error: "Body must be a string"
      });
    }

    // Try to parse the string
    const parsedBody = JSON.parse(req.body);
    
    // Validate that it's an object (not null or array)
    if (typeof parsedBody !== 'object' || parsedBody === null || Array.isArray(parsedBody)) {
      return res.status(400).send({
        message: "Invalid JSON structure",
        error: "Body must be a JSON object"
      });
    }

    // Replace the string body with parsed object
    req.body = parsedBody;
    next();
  } catch (error) {
    return res.status(400).send({
      message: "Invalid JSON format",
      error: error.message
    });
  }
};

module.exports = jsonValidator; 