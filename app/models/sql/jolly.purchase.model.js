'use strict';

module.exports = function(sequelize, DataTypes) {
  const JollyPurchase = sequelize.define('jolly_purchase', {
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

  JollyPurchase.removeAttribute('id');
  return JollyPurchase;
};
