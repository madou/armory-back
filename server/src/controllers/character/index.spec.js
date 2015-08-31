'use strict';

var Controller = require('./index');
var Models = require('../../models');
var q = require('q');
var testDb = require('../../../spec/helpers/db');

describe('character controller', function () {
	var sut;
	var mockGw2Api;
	var models;

	beforeEach(function (done) {
		models = new Models(testDb());
		models.sequelize.sync({
			force: true
		}).then(function () {
			done();
		});

		mockGw2Api = {
			readCharacter: function () {}
		};

		sut = new Controller(models, mockGw2Api);
	});

	it('should reject if character name is not in our db', function (done) {
		sut
			.read('noname')
			.then(null, function () {
				done();
			});
	});

	// the orchestration to get this unit test running is a bit crazy.. 
	// dont really want to mock out the db though. no point when we can
	// test in memory. ill think about it.
	it('should call gw2api if it is in our db', function (done) {
		var defer = q.defer();
		spyOn(mockGw2Api, 'readCharacter').and.returnValue(defer.promise);

		models
			.User
			.create({
				email: 'cool@email',
				passwordHash: 'coolpassword'
			})
			.then(function () {
				return models
					.User
					.findOne({
						where: {
							email: 'cool@email'
						}
					});
			})
			.then(function (data) {
				return models
					.Gw2ApiToken
					.create({
						token: 'swag',
						accountName: 'nameyname',
						UserId: data.id
					});
			})
			.then(function () {
				return models
					.Gw2Character
					.create({
						Gw2ApiTokenToken: 'swag',
						name: 'blastrn'
					});
			})
			.then(function () {
				return sut.read('blastrn');
			})
			.then(function (data) {
				expect(data).toEqual({
					authorization: {
						showPublic: true,
						showGuild: true
					}
				});

				expect(mockGw2Api.readCharacter).toHaveBeenCalledWith('blastrn', {
					token: 'swag',
					showBags: true,
					showCrafting: true
				});

				done();
			});

			defer.resolve({});
	});

	it('should set token to invalid if we recieved a 403 response', function (done) {
		var defer = q.defer();
		spyOn(mockGw2Api, 'readCharacter').and.returnValue(defer.promise);

		models
			.User
			.create({
				email: 'cool@email',
				passwordHash: 'coolpassword'
			})
			.then(function () {
				return models
					.User
					.findOne({
						where: {
							email: 'cool@email'
						}
					});
			})
			.then(function (data) {
				return models
					.Gw2ApiToken
					.create({
						token: 'swag',
						accountName: 'nameyname',
						UserId: data.id
					});
			})
			.then(function () {
				return models
					.Gw2Character
					.create({
						Gw2ApiTokenToken: 'swag',
						name: 'blastrn'
					});
			})
			.then(function () {
				return sut.read('blastrn');
			})
			.then(null, function (data) {
				return models.Gw2ApiToken
					.findOne({
						where: {
							token: 'swag'
						}
					});
			})
			.then(function (data) {
				expect(data.valid).toBe(false);

				done();
			});

			defer.reject({
				status: 403
			});
	});
});