var Sequelize = require('sequelize');

module.exports = {
	TestDb: function () {
    return new Sequelize('database', 'username', 'password', {                                                                                                                                                             
        dialect: 'sqlite',
        logging: false
    });
	}
};