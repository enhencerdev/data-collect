'use strict';

module.exports = function(sequelize, DataTypes) {
  const MngProduct = sequelize.define('mng_product', {
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
    hotelLocation: {
      type: DataTypes.STRING,
      unique: false
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

  MngProduct.removeAttribute('id');
  return MngProduct;
};
