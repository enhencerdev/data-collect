module.exports = function(sequelize, DataTypes) {
  const Product = sequelize.define('product', {
    visitorID: {
      type: DataTypes.STRING,
      unique: false
    },
    pageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    addToBasketCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    productID: {
      type: DataTypes.STRING,
      unique: false
    },
    productCategory1: {
      type: DataTypes.STRING,
      unique: false
    },
    productCategory2: {
      type: DataTypes.STRING,
      unique: false
    },
    productCategory3: {
      type: DataTypes.STRING,
      unique: false
    },
    price: {
      type: DataTypes.INTEGER
    },
    createdAt: {
      field: 'created_at',
      type: DataTypes.DATE
    },
    updatedAt: {
      field: 'updated_at',
      type: DataTypes.DATE
    },
  }, {
    timestamps: true,
    underscored: true,
    /*indexes: [
      {
        unique: true,
        fields: ['visitorID', 'productID', 'productCategory1', 'productCategory2', 'productCategory3']
      }
    ],*/
    classMethods: {
      associate() {
        // associations can be defined here
      }
    }
  });

  Product.removeAttribute('id');
  return Product;
};
