'use strict';

module.exports = function(sequelize, DataTypes) {
  const CruiseBookingProduct = sequelize.define('cruise_booking_product', {
    visitorID: {
      type: DataTypes.STRING,
      unique: false
    },
    productID: {
      type: DataTypes.STRING,
      unique: false
    },
    price: {
      type: DataTypes.INTEGER
    },
    cruiseLength: {
      type: DataTypes.STRING,
      unique: false
    },
    startingLocation: {
      type: DataTypes.STRING,
      unique: false
    },
    cruiseShip: {
      type: DataTypes.STRING,
      unique: false
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

  CruiseBookingProduct.removeAttribute('id');
  return CruiseBookingProduct;
};
