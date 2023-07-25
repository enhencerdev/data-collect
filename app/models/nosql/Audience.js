'use strict';
const mongoose = require('mongoose');

let Audience = new mongoose.Schema({
  name: String,
  path: String,
  type: String,
  platform: String,
  day: Number,
  selectedSegmentNos: [Number],
  includePurchased: Boolean,
  isReady: Boolean,
  isDemo: Boolean
});

module.exports.Audience = Audience;
