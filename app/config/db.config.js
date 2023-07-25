module.exports = {
  HOST: "localhost",
  USER: "root",
  PASSWORD: "password",
  DB: "test",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

/*
module.exports = {
  development: {
    username: 'root',
    password: 'password',
    database: 'test',
    host: '127.0.0.1',
    dialect: 'mysql'
  },
  test: {
    username: 'root',
    password: 'fisherinformationmatrix',
    database: 'boilerplate_test',
    host: '127.0.0.1',
    dialect: 'mysql',
    logging: null
  },
  production: process.env.DATABASE_URL
};
*/
