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

//-----------------------------------------------------------------------------------------------------------------
// Routes
//-----------------------------------------------------------------------------------------------------------------

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
