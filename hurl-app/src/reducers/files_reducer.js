import { GET_FILES_LOADING, GET_FILES_SUCCESS, GET_FILES_ERROR } from '../actions/index.js';

const INITIAL_STATE = {
	isLoading: false,
	error: null,
	files: []
};

export default function filesReducer(state=INITIAL_STATE, action) {
	switch (action.type) {
		case GET_FILES_LOADING:
			return { ...state, ...{ isLoading: true, error: null, files: [] }};
		case GET_FILES_SUCCESS:
			return { ...state, ...{ isLoading: false, error: null, files: action.data }};
		case GET_FILES_ERROR:
			return { ...state, ...{ isLoading: false, error: action.error, files: [] }};
		default:
			return state;
	}
}
