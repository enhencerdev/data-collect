'use strict';
const mongoose = require('mongoose');

let FacebookLog = new mongoose.Schema({
  error: Object,
  message: String,
  userId: String,
});

FacebookLog.set('timestamps', true);

module.exports.FacebookLog = FacebookLog;
