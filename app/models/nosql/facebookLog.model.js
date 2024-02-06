'use strict';
const mongoose = require('mongoose');

let FacebookLog = new mongoose.Schema({
  error: { type: Object, required: false },
  message: { type: String, required: false },
  userId: { type: String, required: false },
});

module.exports.FacebookLog = FacebookLog;
