'use strict';

module.exports = function(sequelize, DataTypes) {
  const MngListing = sequelize.define('mng_listing', {
    
    visitorID: {
      type: DataTypes.STRING,
      unique: false
    },
    priceRange_selected: {
      type: DataTypes.INTEGER
    },
    recommended_selected: {
      type: DataTypes.INTEGER
    },
    region_selected: {
      type: DataTypes.INTEGER
    },
    properties_selected: {
      type: DataTypes.INTEGER
    },
    hotelLocation: {
      type: DataTypes.STRING
    },
    category2: {
      type: DataTypes.STRING
    },
    scrollPercentage: {
      type: DataTypes.INTEGER
    },
    datetime: {
      type: DataTypes.DATE
    },
  }, {
    timestamps: false,
    classMethods: {
      associate() {
        // associations can be defined here
      }
    }
  });

  MngListing.removeAttribute('id');
  return MngListing;
};
