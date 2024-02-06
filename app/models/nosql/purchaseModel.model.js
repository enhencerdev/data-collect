'use strict';
const mongoose = require('mongoose');

let Model = new mongoose.Schema({
  name: String,
  userId: mongoose.Schema.Types.ObjectId,
  projectId: mongoose.Schema.Types.ObjectId,
  questionType: Number,
  algorithmType: String,
  overallResult: Number,
  targetChoice: Object,
  segmentsTree: Array,
  current: Boolean
});

module.exports.PurchaseModel = Model;
