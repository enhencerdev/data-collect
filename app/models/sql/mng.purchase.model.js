'use strict';

module.exports = function(sequelize, DataTypes) {
  const MngPurchase = sequelize.define('mng_purchase', {
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

  MngPurchase.removeAttribute('id');
  return MngPurchase;
};
