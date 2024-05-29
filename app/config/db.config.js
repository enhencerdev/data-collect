const path = require('path');
const fs = require('fs');

const localSslCertFilePath = path.join(__dirname, 'db_certs', 'enhencerdemo_mysql_db.crt.pem');
const sslCertFilePath = path.join(__dirname, 'db_certs', 'enhencer_mysql_db.crt.pem');

module.exports = {
  development: {
    username: "root",
    password: "hesoyam9",
    host: "localhost",
    database: "enhencer",
    dialect: "mysql"
  },
  production: {
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DBNAME,
    host: process.env.MYSQL_HOST,
    port: 3306,
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        ca: fs.readFileSync(sslCertFilePath)
      }
    }
  }
};

