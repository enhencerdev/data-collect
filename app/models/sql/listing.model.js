module.exports = function(sequelize, DataTypes) {
  const Listing = sequelize.define('listing', {
    visitorID: {
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
    pageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 1
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
        fields: ['visitorID', 'productCategory1', 'productCategory2', 'productCategory3']
      }
    ],*/
    classMethods: {
      associate() {
        // associations can be defined here
      }
    }
  });

  Listing.removeAttribute('id');
  return Listing;
};
