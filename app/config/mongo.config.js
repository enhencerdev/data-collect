module.exports = {
  development: 'mongodb://enhencer:fisherinformationmatrix@localhost/Enhencer?authSource=admin',
  test: 'mongodb://enhencer:fisherinformationmatrix@localhost/EnhencerDB?authSource=admin',
  production: process.env.MONGO_DATABASE_URL
};

