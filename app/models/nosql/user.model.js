'use strict';
const mongoose = require('mongoose');


const User = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: { type: String, select: false },
  companyName: String,
  title: String,
  contactNumber: String,
  url: String,
  percentage: Number,
  thresholds: Array,
  token: String,
  key: String,
  googleAds: Object,
  facebookAds: Object
});

module.exports.User = User;
