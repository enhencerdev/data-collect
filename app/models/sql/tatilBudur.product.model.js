'use strict';

module.exports = function(sequelize, DataTypes) {
  const TatilBudurProduct = sequelize.define('tatil_budur_product', {
    visitorID: {
      type: DataTypes.STRING,
      unique: false
    },
    productID: {
      type: DataTypes.STRING,
      unique: false
    },
    review: {
      type: DataTypes.FLOAT
    },
    category1: {
      type: DataTypes.STRING,
      unique: false
    },
    category2: {
      type: DataTypes.STRING,
      unique: false
    },
    hotelLocation: {
      type: DataTypes.STRING,
      unique: false
    },
    pictureViewed: {
      type: DataTypes.INTEGER
    },
    scrollPercentage: {
      type: DataTypes.INTEGER
    },
    price: {
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

  TatilBudurProduct.removeAttribute('id');
  return TatilBudurProduct;
};
