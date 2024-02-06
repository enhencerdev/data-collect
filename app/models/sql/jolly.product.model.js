'use strict';

module.exports = function(sequelize, DataTypes) {
  const JollyProduct = sequelize.define('jolly_product', {
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
    location: {
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

  JollyProduct.removeAttribute('id');
  return JollyProduct;
};
