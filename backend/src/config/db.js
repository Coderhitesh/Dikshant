const sequelize = new Sequelize(
  'u748895167_test_dikhshant', // database
  'u748895167_test_dikhshant', // username
  'Test_dikhshant1234',         // password
  {
    host: '217.21.84.103',      // DB server IP
    port: 3307,                  // check this matches your DB
    dialect: 'mysql',
    logging: console.log,        // optional
    define: { underscored: true, timestamps: true },
    timezone: "+05:30",
    dialectOptions: {
      useUTC: false,
      dateStrings: true,
      typeCast: function (field, next) {
        if (field.type === "DATETIME") return field.string();
        return next();
      },
    },
  }
);

module.exports = sequelize;
