const jsonValidator = (req, res, next) => {
  // Skip validation for GET requests
  if (req.method === 'GET') {
    return next();
  }

  try {
    // Handle case where body might be undefined due to aborted request
    if (!req.body) {
      return res.status(400).send({
        message: "Missing request body",
        error: "Request body is required"
      });
    }
    
    // If body already parsed as object (from another middleware), use it directly
    if (typeof req.body === 'object' && req.body !== null) {
      return next();
    }

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