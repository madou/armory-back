const newFields = require('../lib/newFields');

const fields = (Sequelize = {}) => ({
  invalid: Sequelize.BOOLEAN,
});

module.exports = newFields(fields, 'Gw2ApiToken');