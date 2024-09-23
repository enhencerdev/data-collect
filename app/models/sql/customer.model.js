module.exports = (sequelize, Sequelize) => {
  const Customer = sequelize.define("customer", {
    visitorID: {
      type: Sequelize.STRING,
      primaryKey: true,
      unique: false,
      
    },
    // ???
    customerID: {
      type: Sequelize.STRING,
      unique: false
    },
    city: {
      type: Sequelize.STRING,
      unique: false
    },
    country: {
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
    add_to_basket: {
      type: Sequelize.INTEGER
    },
    last_add_to_basket_time: {
      type: Sequelize.DATE
    },
    product_viewer: {
      type: Sequelize.INTEGER
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
    segment: {
      type: Sequelize.INTEGER
    },
    expected_revenue: {
      type: Sequelize.FLOAT
    },
    revenue_segment: {
      type: Sequelize.INTEGER
    },
    score: {
      type: Sequelize.INTEGER
    },
    enhencer_audience: {
      type: Sequelize.INTEGER
    },
    b_audience: {
      type: Sequelize.INTEGER
    },
    enh_conv_rem: {
      type: Sequelize.INTEGER
    },
    enh_dpa_rem: {
      type: Sequelize.INTEGER
    },
    enh_gdn_rem: {
      type: Sequelize.INTEGER
    },
    enh_conv_high_intent_rem: {
      type: Sequelize.INTEGER
    },
    enh_dpa_high_intent_rem: {
      type: Sequelize.INTEGER
    },
    enh_perf_max_rem: {
      type: Sequelize.INTEGER
    },
    enh_search_rem: {
      type: Sequelize.INTEGER
    },
    enh_rlsa_rem: {
      type: Sequelize.INTEGER
    },
    enh_conv_lal: {
      type: Sequelize.INTEGER
    },
    enh_dpa_lal: {
      type: Sequelize.INTEGER
    },
    enh_traffic_lal: {
      type: Sequelize.INTEGER
    },
    enhencer_audience_1: {
      type: Sequelize.INTEGER
    },
    enhencer_audience_2: {
      type: Sequelize.INTEGER
    },
    enhencer_audience_3: {
      type: Sequelize.INTEGER
    },
    enhencer_audience_4: {
      type: Sequelize.INTEGER
    },
    enhencer_audience_5: {
      type: Sequelize.INTEGER
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
