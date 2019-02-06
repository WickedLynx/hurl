var bcrypt = require('bcrypt');
var config = require('../config.js');
var mysql = require('mysql');
var shortid = require('shortid');

const TOKEN_TYPE_PERMANENT = 'permanent';
const TOKEN_TYPE_ONCE = 'once';
const TOKEN_TYPE_TIMED = 'timed';
const TOKEN_TYPE_PASSWORD = 'password';

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

	authenticateUser: function(email, password) {
		const conn = this.connection;
		return new Promise(function(resolve, reject) {
			if (!email || email.length === 0 || !password || password.length === 0) {
				reject(Error('Invalid username/password'));
				return;
			}
			conn.query('SELECT id, email, date_created, password FROM `users` WHERE `email` = ?', [email],
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
					delete user.password;
					resolve(user);
				});
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

	fileForToken: function(token) {
		const conn = this.connection;
		return new Promise(function(resolve, reject) {
			if (!token) {
				reject(Error('Invalid token ID'));
				return;
			}
			conn.query('SELECT tokens.type, tokens.value, tokens.date_expires, files.path FROM `tokens` INNER JOIN `files` ON tokens.file_id = files.id WHERE `value` = ?', [token], function(err, results) {
				if (err) {
					reject(err);
					return;
				}
				if (results.length === 0) {
					reject(Error('File not found'));
					return;
				}
				var downloadInfo = results[0];
				if (downloadInfo.type === TOKEN_TYPE_PERMANENT) {
					resolve(downloadInfo);
					return;
				}
			});
		});
	},

	selectTokensWithFileID: function(fileID) {
		const conn = this.connection;
		return new Promise(function(resolve, reject) {
			if (!fileID) {
				reject(Error('Invalid file ID'));
				return;
			}
			conn.query('SELECT * FROM `tokens` WHERE `file_id` = ?', [fileID], function(err, results) {
				if (err) {
					reject(err);
					return;
				}
				resolve(results);
			});
		});
	},

	selectAllFiles: function(user) {
		const conn = this.connection;
		const selectToken = this.selectTokensWithFileID.bind(this);
		return new Promise(function(resolve, reject) {
			if (!user) {
				reject(Error('User does not exist'));
				return;
			}
			conn.query('SELECT id, name, size, date_created FROM `files` WHERE `user_id` = ? ORDER BY `date_created` DESC', [user.id], function(err, results) {
				if (err) {
					reject(err);
					return;
				}
				if (results.length === 0) {
					resolve(results);
				}
				var promises = results.map(function(file) {
					return selectToken(file.id);
				});
				Promise.all(promises).then(function(tokenArrays) {
					if (tokenArrays.length !== results.length) {
						reject(Error('Improper token fetch'));
						return;
					}
					for (var i = 0; i < results.length; i++) {
						var file = results[i];
						var tokens = tokenArrays[i];
						Object.assign(file, { tokens: tokens });
					}
					resolve(results);
				}).catch(reject);
			});
		});
	},

	addFile: function(user, path, size, name) {
		var me = this;
		return new Promise(function(resolve, reject) {
			me.createFile(user.id, path, size,  name).then(function(file) {
				resolve(file);
			}).catch(reject);
		});
	},

	createToken: function(type, value=shortid.generate(), fileID, dateExpires=null) {
		return this.insertToken(type, value, fileID, dateExpires).then(this.tokenWithID.bind(this));
	},

	insertToken: function(type, value, fileID, dateExpires=null) {
		const conn = this.connection;
		return new Promise(function(resolve, reject) {
			if (!type || !value || !fileID) {
				reject(Error('Missing compulsary fields'));
				return;
			}
			conn.query('INSERT INTO `tokens` (type, value, date_expires, file_id) VALUES (?, ?, ?, ?)', [type, value, dateExpires, fileID], function(err, results, fields) {
				if (err) {
					reject(err);
					return;
				}
				if (!results.insertId) {
					reject(Error('Unable to insert token'));
					return;
				}
				resolve(results.insertId);
			});
		});
	},

	tokenWithID: function(tokenID) {
		const conn = this.connection;
		return new Promise(function(resolve, reject) {
			if (!tokenID) {
				reject(Error('Invalid token id'));
				return;
			}
			conn.query('SELECT * FROM `tokens` WHERE `id` = ?', [tokenID], function(err, results) {
				if (err) {
					reject(err);
					return;
				}
				if (results.length === 0) {
					reject(Error('No tokens found'));
					return;
				}
				resolve(results[0]);
			});
		});
	},

	tokenWithValue: function(tokenValue) {
		const conn = this.connection;
		return new Promise(function(resolve, reject) {
			if (!tokenValue) {
				reject(Error('Invalid token id'));
				return;
			}
			conn.query('SELECT * FROM `tokens` WHERE `value` = ?', [tokenValue], function(err, results) {
				if (err) {
					reject(err);
					return;
				}
				if (results.length === 0) {
					reject(Error('No tokens found'));
					return;
				}
				resolve(results[0]);
			});
		});
	},


	createFile: function(userID, filePath, size, fileName) {
		var cb = this.fileWithID.bind(this);
		return this.insertFile(userID, filePath, size, fileName).then(cb);
	},

	insertFile: function(userID, filePath, size,  fileName) {
		const conn = this.connection;
		return new Promise(function(resolve, reject) {
			if (!userID || !filePath || !fileName) {
				reject(Error('Missing either userID or filePath or fileName'));
				return;
			}
			conn.query('INSERT INTO `files` (name, path, size, user_id) VALUES (?, ?, ?, ?)', [fileName, filePath, size,  userID],
				function(err, results, fields) {
					if (err) {
						reject(err);
						return;
					}
					if (!results.insertId) {
						reject(Error('Failed to insert'));
						return;
					}
					resolve(results.insertId);
				});
		});
	},

	fileWithID: function(fileID) {
		const conn = this.connection;
		return new Promise(function(resolve, reject) {
			if (!fileID) {
				reject(Error('Invalid file ID'));
				return;
			}
			conn.query('SELECT id, name, size, date_created from `files` where `id` = ?', [fileID], function(err, results, fields) {
				if (err) {
					reject(err);
					return;
				}
				if (results.length === 0) {
					reject(Error('No records'));
					return;
				}
				resolve(results[0]);
			});
		});
	}
}

module.exports = dbHelper;
