'use strict';

module.exports = function(sequelize, DataTypes) {
  const TatilBudurListing = sequelize.define('tatil_budur_listing', {
    visitorID: {
      type: DataTypes.STRING,
      unique: false
    },
    theme_selected: {
      type: DataTypes.INTEGER
    },
    specialPeriod_selected: {
      type: DataTypes.INTEGER
    },
    action_selected: {
      type: DataTypes.INTEGER
    },
    general_selected: {
      type: DataTypes.INTEGER
    },
    sportsEntertainment_selected: {
      type: DataTypes.INTEGER
    },
    children_selected: {
      type: DataTypes.INTEGER
    },
    hotelType_selected: {
      type: DataTypes.INTEGER
    },
    price_selected: {
      type: DataTypes.INTEGER
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

  TatilBudurListing.removeAttribute('id');
  return TatilBudurListing;
};
