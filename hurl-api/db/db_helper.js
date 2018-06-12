var bcrypt = require('bcrypt');
var config = require('../config.js');
var mysql = require('mysql');

var dbHelper = {
	connection: null,
	
	hashPassword: function(password) {
		return new Promise(function (resolve, reject) {
			bcrypt.genSalt(config.saltWorkFactor, function(err, salt) {
				if (err) {
					reject(err);
					return;
				}
				bcrypt.hash(password, salt, function (err, hash) {
					if (err) {
						reject(err);
						return;
					}
					resolve(hash);
				});
			});
		});
	},

	createUserIfNeeded: function(email, password) {
		var me = this;
		return new Promise(function(resolve, reject) {
			me.connection.query('SELECT * FROM `users` WHERE `email` = ?', [email], function(err, results, fields) {
				if (err) {
					reject(err);
					return;
				}

				if (results.length > 0) {
					resolve(results[0]);
					return;
				}

				me.hashPassword(password).then(function(hash) {
					me.connection.query('INSERT INTO `users` (email, password) VALUES (?, ?)', [email, hash],
						function(err, results, fields) {
						if (err) {
							reject(err);
							return;
						}
						resolve(results[0]);

					});
				}).catch(reject);
			});
		});
	},

	setup: function() {
		this.connection = mysql.createConnection({
			host: 'localhost',
			user: 'root',
			database: 'hurl'
		});

		const me = this;
		var email = config.username;
		var password = config.password;

		this.connection.connect(function(err) {
			if (err) {
				console.log(err);
				return;
			}
			if (!email || !password || email.length === 0 || password.length === 0) {
				return;
			}
			console.log('connected successfully');
			me.createUserIfNeeded(email, password)
			.then(function() {
				console.log('Created new user with email: ' + email);	
			}).catch(function(error) {
				console.log('Failed to create user: ' + error);
			});
		});
	},

	userWithID: function(userID) {
		var conn = this.connection;
		return new Promise(function (resolve, reject) {
			if (userID < 0) {
				reject(Error("Invalid user"));
				return;
			}
			conn.query('SELECT * FROM users WHERE id = ?', [userID],
			function(err, results) {
				if (err) {
					reject(err);
					return;
				}
				if (results.length === 0) {
					reject(Error("User not found"));
					return;
				}
				resolve(results[0]);
			});
		});
	},

	authenticateUser: function(email, password) {
		const conn = this.connection;
		return new Promise(function(resolve, reject) {
			if (!email || email.length === 0 || !password || password.length === 0) {
				reject(Error('Invalid username/password'));
				return;
			}
			conn.query('SELECT * FROM users WHERE email = ?', [email],
				function(err, results) {
				if (err) {
					reject(err);
					return;
				}
				if (results.length === 0) {
					reject(Error('User not found'));
					return;
				}
				var user = results[0];
				bcrypt.compare(password, user.password, function(err, isMatch) {
					if (err) {
						reject(err);
						return;
					}
					if (!isMatch) {
						reject(Error('Passwords do not match'));
						return;
					}
					resolve(user);
				});
			});
		});
	}

}

module.exports = dbHelper;
