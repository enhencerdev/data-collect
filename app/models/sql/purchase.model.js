module.exports = function(sequelize, DataTypes) {
  const Purchase = sequelize.define('purchase', {
    visitorID: {
      type: DataTypes.STRING,
      unique: false
    },
    dateTime: {
      type: DataTypes.DATE
    },
    // ???
    basketID: {
      type: DataTypes.STRING,
      unique: false
    },
    productID: {
      type: DataTypes.STRING,
      unique: false
    },
    amount: {
      type: DataTypes.INTEGER
    },
    price: {
      type: DataTypes.INTEGER
    },
    type: {
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

  Purchase.removeAttribute('id');
  return Purchase;
};
