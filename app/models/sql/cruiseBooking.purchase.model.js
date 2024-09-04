 'use strict';

module.exports = function(sequelize, DataTypes) {
  const CruiseBookingPurchase = sequelize.define('cruise_booking_purchase', {
    visitorID: {
      type: DataTypes.STRING,
      unique: false
    },
    dateTime: {
      type: DataTypes.DATE
    },
    type: {
      type: DataTypes.STRING,
      unique: false
    },
    totalPrice: {
      type: DataTypes.STRING,
      unique: false
    }
  }, {
    timestamps: false,
    classMethods: {
      associate() {
        // associations can be defined here
      }
    }
  });

  CruiseBookingPurchase.removeAttribute('id');
  return CruiseBookingPurchase;
};
