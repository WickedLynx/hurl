import { CREATE_TOKEN_LOADING, CREATE_TOKEN_SUCCESS, CREATE_TOKEN_ERROR } from '../actions/index';

const initialState = {
	isLoading: false,
	success: false,
	error: null
}

const createTokenReducer = (state=initialState, action) => {
	switch (action.type) {
		case CREATE_TOKEN_LOADING:
			return { isLoading: true, success: false, error: null }
		case CREATE_TOKEN_SUCCESS:
			return { isLoading: false, success: true, error: null }
		case CREATE_TOKEN_ERROR:
			return { isLoading: false, success: false, error: action.error }
		default:
			return state
	}
}

export default createTokenReducer;
