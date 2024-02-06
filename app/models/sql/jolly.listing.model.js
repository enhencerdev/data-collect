'use strict';

module.exports = function(sequelize, DataTypes) {
  const JollyListing = sequelize.define('jolly_listing', {

    visitorID: {
      type: DataTypes.STRING,
      unique: false
    },
    priceRange_selected: {
      type: DataTypes.INTEGER
    },
    region_selected: {
      type: DataTypes.INTEGER
    },
    accomodationType_selected: {
      type: DataTypes.INTEGER
    },
    healthAndSecurity_selected: {
      type: DataTypes.INTEGER
    },
    facility_selected: {
      type: DataTypes.INTEGER
    },
    theme_selected: {
      type: DataTypes.INTEGER
    },
    location: {
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

  JollyListing.removeAttribute('id');
  return JollyListing;
};
