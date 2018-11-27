import axios from 'axios';
import CredentialStore from '../other/credential_store';

export const AUTH_LOADING = 'AUTH_LOADING';
export const AUTH_SUCCESS = 'AUTH_SUCCESS';
export const AUTH_ERROR = 'AUTH_ERROR';

export const UPLOAD_LOADING = 'UPLOAD_LOADING';
export const UPLOAD_SUCCESS = 'UPLOAD_SUCCESS';
export const UPLOAD_ERROR = 'UPLOAD_ERROR';

export const GET_FILES_LOADING = 'GET_FILES_LOADING';
export const GET_FILES_SUCCESS = 'GET_FILES_SUCCESS';
export const GET_FILES_ERROR = 'GET_FILES_ERROR';

export const SELECT_FILE = 'SELECT_FILE';

export const API_URL = 'http://localhost:3064';

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

export const getFiles = () => dispatch => {
	dispatch({
		type: GET_FILES_LOADING
	});

	axios.get(API_URL + '/files', { headers: CredentialStore.authHeader() })
	.then(response => {
		dispatch({
			type: GET_FILES_SUCCESS,
			data: response.data.data
		});
	}).catch(error => {
		dispatch({
			type: GET_FILES_ERROR,
			error: parseError(error)
		});
	});
}

export const selectFile = (file) => dispatch => {
	dispatch({
		type: SELECT_FILE,
		id: file.id
	});
}

export const upload = (file) => dispatch => {
	dispatch({
		type: UPLOAD_LOADING
	});

	if (!file) {
		dispatch({
			type: UPLOAD_ERROR,
			error: 'File not found'
		});
		return;
	}

	var formData = new FormData();
	formData.append('file', file, file.name);
	return axios.post(API_URL + '/upload', formData, { headers: CredentialStore.authHeader() })
	.then(response => {
		dispatch(getFiles());
		dispatch({
			type: UPLOAD_SUCCESS,
			data: response.data.data
		});
	}).catch(error => {
		dispatch({
			type: UPLOAD_ERROR,
			error: parseError(error)
		});
	});
}

