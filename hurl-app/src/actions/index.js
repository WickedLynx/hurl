import axios from 'axios';

export const AUTH_LOADING = 'AUTH_LOADING';
export const AUTH_SUCCESS = 'AUTH_SUCCESS';
export const AUTH_ERROR = 'AUTH_ERROR';

const API_URL = 'http://localhost:3064';

function parseError(error) {
	var errorToReturn = { message: "Unknown error :(", code: 500 };
	if (error && error.response && error.response.data) {
		errorToReturn.message = error.response.data.message || 'Unknown error :(';
		errorToReturn.code = error.response.data.code || 500;
	}
	return errorToReturn;
}

export const login = (email, password) => dispatch => {
	dispatch({
		type: AUTH_LOADING
	});

	return axios.post(API_URL + '/login', {
		email: email,
		password: password
	}).then(response => {
		dispatch({
			type: AUTH_SUCCESS,
			data: response.data.data
		});
	}).catch(error => {
		dispatch({
			type: AUTH_ERROR,
			error: parseError(error)
		});
	});
}
		
