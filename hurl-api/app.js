var express = require('express');
var cors = require('cors');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var passport = require('passport');
var passportJwt = require('passport-jwt');
var extractJwt = passportJwt.ExtractJwt;
var jwtStrategy = passportJwt.Strategy;
var config = require('./config.js');
var dbHelper = require('./db/db_helper.js');
var formidable = require('formidable');
var shortid = require('shortid');
const constants = require('./db/constants.js');

dbHelper.setup();
var app = express();
app.use(cors());
app.use(bodyParser.json());

//-----------------------------------------------------------------------------------------------------------------
// Auth
//-----------------------------------------------------------------------------------------------------------------

var jwtOptions = {};
jwtOptions.jwtFromRequest = extractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = config.jwtSecret;

var strategy = new jwtStrategy(jwtOptions, function(jwtPayload, next) {
	dbHelper.userWithID(jwtPayload.id).then(function(user) {
		if (user) {
			next(null, user);
		} else {
			next(null, false);
		}
	}).catch(function(error) {
		next(error, false);
	});
});

passport.use(strategy);

//-----------------------------------------------------------------------------------------------------------------
// Routes
//-----------------------------------------------------------------------------------------------------------------

app.get('/files', passport.authenticate('jwt', { session: false }), function(req, res) {
	var user = req.user;
	if (!user) {
		postError(res, 401, 'User not found');
		return;
	}
	dbHelper.selectAllFiles(user).then(function(files) {
		postSuccess(res, files);
	}).catch(function(err) {
		console.log(err);
		postError(res, 500, 'Internal error');
	});
});

app.get('/files/:token', function(req, res) {
	dbHelper.fileForToken(req.params.token).then(function(fileInfo) {
		res.download(fileInfo.path);
	}).catch(function(error) {
		console.log(error);
		postError(res, 500, error);
	});
});

app.get('/tokens/:tokenValue', function(req, res) {
	dbHelper.tokenWithValue(req.params.tokenValue)
	.then(function(tokenInfo) {
		postSuccess(res, tokenInfo);
	})
	.catch(function(error) {
		console.log(error);
		postError(res, 404, error);
	});
});

app.post('/login', function(req, res) {
	var email = req.body.email;
	var password = req.body.password;
	dbHelper.authenticateUser(email, password).then(function(user) {
		if (!user) {
			postError(res, 404, 'User not found');
			return;
		}
		var payload = { id: user.id };
		var token = jwt.sign(payload, jwtOptions.secretOrKey);
		postSuccess(res, { user: user, token: token });
	}).catch(function(err) {
		postError(res, 404, 'User not found');
	});
});

app.post('/upload', passport.authenticate('jwt', { session: false }), function(req, res) {
	var user = req.user;
	if (!user) {
		postError(res, 401, 'You need to login first');
		return;
	}
	var form = new formidable.IncomingForm();
	form.parse(req);
	form.on('fileBegin', function(name, file) {
		file.path = __dirname + '/uploads/' + shortid.generate() + '_' + (file.name || 'unknown');
	});

	form.on('file', function(name, file) {
		dbHelper.addFile(user, file.path, file.size, (file.name || 'unknown')).then(function(token) {
			postSuccess(res, {});
		}).catch(function(err) {
			console.log(err);
			postError(res, 500, err);
		});
	});

	form.on('error', function(err) {
		console.log('upload error');
		console.log(err);
		postError(res, 500, err);
	});
});

app.post('/files/:fileID/links', passport.authenticate('jwt', { session: false }), function(req, res) {
	const user = req.user;
	if (!user) {
		postError(res, 401, 'You need to login first');
		return;
	}
	const fileID = req.params.fileID;
	const type = req.body.type;
	const notes = req.body.notes || null;
	const password = req.body.password || null;
	const duration = req.body.duration || null;
	dbHelper.createToken(type, fileID, notes, password, duration)
	.then(function(result) {
		postSuccess(res, { result: 'Token added' });
	})
	.catch(function(err) {
		console.log(err);
		postError(res, 500, 'Internal server error');
	});
});

app.delete('/tokens/:tokenValue', passport.authenticate('jwt', { session: false }), function(req, res) {
	if (!req.user) {
		postError(res, 401, 'Login please');
		return;
	}
	const value = req.params.tokenValue;
	dbHelper.deleteToken(value)
	.then(function() {
		postSuccess(res, {});
	}).catch(function(error) {
		postError(res, 500, error);
	});
});

app.delete('/files/:fileID', passport.authenticate('jwt', { session: false }), function(req, res) {
	if (!req.user) {
		postError(res, 401, 'Login please');
		return;
	}
	const fileID = req.params.fileID;
	dbHelper.deleteFile(fileID)
	.then(function() {
		postSuccess(res, {});
	}).catch(function(error) {
		postError(res, 500, error);
	});
});


//-----------------------------------------------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------------------------------------------

function postSuccess(res, object) {
	res.status(200).json({
		data: object,
		error: null
	});
}

function postError(res, code, err) {
	res.status(code).json({
		data: null,
		error: {
			code: code,
			message: err
		}
	});
}

app.listen(3064, '127.0.0.1', function() {
	console.log('Backend fired up!');
});
