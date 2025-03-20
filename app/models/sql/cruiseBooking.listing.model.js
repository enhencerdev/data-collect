'use strict';

module.exports = function(sequelize, DataTypes) {
  const CruiseBookingListing = sequelize.define('cruise_booking_listing', {
    visitorID: {
      type: DataTypes.STRING,
      unique: false
    },
    sailingDate_selected: {
      type: DataTypes.INTEGER
    },
    price_selected: {
      type: DataTypes.INTEGER
    },
    cruiseLength_selected: {
      type: DataTypes.INTEGER
    },
    destination_selected: {
      type: DataTypes.INTEGER
    },
    departurePort_selected: {
      type: DataTypes.INTEGER
    },
    cruiseLine_selected: {
      type: DataTypes.INTEGER
    },
    cruiseShip_selected: {
      type: DataTypes.INTEGER
    },
    arrivalPort_selected: {
      type: DataTypes.INTEGER
    },
    maxOccupancy_selected: {
      type: DataTypes.INTEGER
    },
    supplierPromotion_selected: {
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

  CruiseBookingListing.removeAttribute('id');
  return CruiseBookingListing;
};
