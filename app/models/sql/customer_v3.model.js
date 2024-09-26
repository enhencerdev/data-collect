module.exports = (sequelize, Sequelize) => {
  const Customer = sequelize.define("customer", {
    visitorID: {
      type: Sequelize.STRING,
      primaryKey: true,
      unique: false,
    },
    customerID: {
      type: Sequelize.STRING,
      unique: false
    },
    deviceType: {
      type: Sequelize.STRING,
      unique: false
    },
    scrollPercentage: {
      type: Sequelize.INTEGER
    },
    searched: {
      type: Sequelize.INTEGER
    },
    sessionDuration: {
      type: Sequelize.INTEGER
    },
    last_add_to_basket_time: {
      type: Sequelize.DATE
    },
    last_product_view_time: {
      type: Sequelize.DATE
    },
    purchase_time: {
      type: Sequelize.DATE
    },
    source: {
      type: Sequelize.STRING
    },
    purchase_propensity: {
      type: Sequelize.FLOAT
    },
    audience_events: {
      type: Sequelize.STRING
    },
    createdAt: {
      field: 'created_at',
      type: Sequelize.DATE
    },
    updatedAt: {
      field: 'updated_at',
      type: Sequelize.DATE
    },
    
  },  {
    timestamps: true,
    underscored: true,
    classMethods: {
      associate() {
        // associations can be defined here
      }
    }
  });

  return Customer;
};
