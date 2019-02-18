var bcrypt = require('bcrypt');
var config = require('../config.js');
var mysql = require('mysql');
var shortid = require('shortid');
var fs = require('fs');
const constants = require('./constants.js');

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

	fileForToken: function(token, password) {
		const conn = this.connection;
		const deleteToken = this.deleteToken.bind(this);
		const hashPassword = this.hashPassword.bind(this);
		return new Promise(function(resolve, reject) {
			if (!token) {
				reject(Error('Invalid token ID'));
				return;
			}
			conn.query('SELECT tokens.type, tokens.value, tokens.password, tokens.date_expires, files.path FROM `tokens` INNER JOIN `files` ON tokens.file_id = files.id WHERE `value` = ?', [token], function(err, results) {
				if (err) {
					reject(err);
					return;
				}
				if (results.length === 0) {
					reject(Error('File not found'));
					return;
				}
				var downloadInfo = results[0];
				switch (downloadInfo.type) {
					case constants.tokenTypes.permanent: {
						resolve(downloadInfo);
						break;
					}

					case constants.tokenTypes.once: {
						deleteToken(token)
						.then(function() { })
						.catch(function(e) {});
						resolve(downloadInfo);
						break;
					}

					case constants.tokenTypes.timed: {
					const now = new Date();
					if (now > downloadInfo.date_expires) {
						deleteToken(token)
						reject(Error('Link expired'));
						return;
					}
					resolve(downloadInfo);
					break;
					}

					case constants.tokenTypes.password: {
						if (!password) {
							reject(Error('Invalid password'));
							return;
						}
						bcrypt.compare(password, downloadInfo.password, function(err, isMatch) {
							if (err) {
								reject(Error('Incorrect password'));
								return;
							}
							if (!isMatch) {
								reject(Error('Passwords do not match'));
								return;
							}
							resolve(downloadInfo);
						});
						break;
					}

					default: {
						reject(Error('Invalid token'));
						break;
					}
				}
			});
		});
	},

	fileInfoWithID: function(fileID) {
		const conn = this.connection;
		return new Promise(function(resolve, reject) {
			console.log(fileID);
			if (!fileID) {
				reject(Error('Invalid file ID'));
				return;
			}
			conn.query('SELECT * from `files` where `id` = ?', [fileID], function(err, results) {
				console.log(err, results);
				if (err) {
					reject(err);
					return;
				}
				if (results.length === 0) {
					reject(Error('File not found'));
					return;
				}
				resolve(results[0]);
			});
		});
	},

	deleteFileAtPath: function(filePath) {
		fs.unlink(filePath, function() {
			console.log('Deleted file at ', filePath);
		});
	},

	selectTokensWithFileID: function(fileID) {
		const conn = this.connection;
		return new Promise(function(resolve, reject) {
			if (!fileID) {
				reject(Error('Invalid file ID'));
				return;
			}
			conn.query('SELECT id, type, value, date_created, notes FROM `tokens` WHERE `file_id` = ?', [fileID], function(err, results) {
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

	deleteToken: function(value) {
		const conn = this.connection;
		return new Promise(function(resolve, reject) {
			if (!value) {
				resolve();
				return;
			}

			conn.query('DELETE FROM `tokens` WHERE `value` = ?', [value], function(err, results) {
				if (err) {
					reject(err);
					return;
				}
				resolve();
			});
		});
	},

	deleteFile: function(fileID) {
		const conn = this.connection;
		const deleteTokens = this.deleteAllTokensForFile.bind(this);
		const fileInfoWithID = this.fileInfoWithID.bind(this);
		const deleteFileAtPath = this.deleteFileAtPath.bind(this);
		return new Promise(function(resolve, reject) {
			if (!fileID) {
				reject(Error('Invalid file ID'));
				return;
			}
			fileInfoWithID(fileID) 
			.then(function(fileDetails) {
				deleteFileAtPath(fileDetails.path);
				conn.query('DELETE FROM `files` where `id` = ?', [fileID], function(err, result) {
					if (err) {
						reject(err);
						return;
					}
					deleteTokens(fileID).then(resolve).catch(reject);
				});
			})
			.catch(reject);
		});
	},

	deleteAllTokensForFile: function(fileID) {
		const conn = this.connection;
		return new Promise(function(resolve, reject) {
			conn.query('DELETE FROM `tokens` where `file_id` = ?', [fileID], function(err, result) {
				if (err) {
					reject(err);
					return;
				}
				resolve();
			});
		});
	},

	createToken: function(type, fileID, notes=null, password=null, duration=null) {
		const me = this;
		return new Promise(function(resolve, reject) {
			if (!type || !fileID) {
				reject(Error('Missing compulsary fields'));
				return;
			}
			switch (type) {
				case constants.tokenTypes.password: {
					if (!password) {
						reject(Error('Missing password'));
						return;
					}
					me
					.hashPassword(password)
					.then(function(hash) {
						me.insertToken(type, fileID, notes, hash, null).then(resolve).catch(reject);
					})
					.catch(function(error) {
						reject(error);
					})
					break;
				}

				case constants.tokenTypes.timed: {
					if (!duration) {
						reject(Error('Missing duration'));
						return;
					}
					const now = new Date();
					const expiryDate = new Date(now.getTime() + duration * 1000);
					me.insertToken(type, fileID, notes, null, expiryDate).then(resolve).catch(reject);
					break;
				}

				case constants.tokenTypes.permanent:
				case constants.tokenTypes.once: {
					me.insertToken(type, fileID, notes, null, null).then(resolve).catch(reject);
					break;
				}

				default: {
					reject(Error('Invalid token type'));
					break;
				}
			}
		});
	},

	insertToken: function(type, fileID, notes=null, password=null, dateExpires=null) {
		const conn = this.connection;
		const value = shortid.generate();
		return new Promise(function(resolve, reject) {
			if (!type || !fileID) {
				reject(Error('Missing compulsary fields'));
				return;
			}
			conn.query('INSERT INTO `tokens` (type, file_id, value, notes, password,  date_expires) VALUES (?, ?, ?, ?, ?, ?)', [type, fileID, value, notes, password,  dateExpires], function(err, results, fields) {
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
