'use strict';
const mongoose = require('mongoose');
const Audience = require('./audience.model');

let Project = new mongoose.Schema({
  name: String,
  userId: mongoose.Schema.Types.ObjectId,
  type: String,
  connectQuery: String,
  questionList: Array,
  idQuestionList: Array,
  audiences: [Audience],
  isDemo: Boolean,
  isReady: Boolean
});

module.exports.PurchaseProject = Project;
