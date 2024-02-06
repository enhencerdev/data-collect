'use strict';

module.exports = function(sequelize, DataTypes) {
  const TatilBudurPurchase = sequelize.define('tatil_budur_purchase', {
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

  TatilBudurPurchase.removeAttribute('id');
  return TatilBudurPurchase;
};
