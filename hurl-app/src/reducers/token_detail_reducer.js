import { GET_TOKEN_DETAIL_LOADING, GET_TOKEN_DETAIL_SUCCESS, GET_TOKEN_DETAIL_ERROR } from '../actions/index';

const INITIAL_STATE = {
	token: null,
	error: null,
	isLoading: false
}

export default function tokenDetailReducer(state=INITIAL_STATE, action) {
	switch (action.type) {
		case GET_TOKEN_DETAIL_LOADING:
			return { ...state, ...{ isLoading: true, error: null, token: null } }
		case GET_TOKEN_DETAIL_SUCCESS:
			return { ...state, ...{ isLoading: false, error: null, token: action.data }}
		case GET_TOKEN_DETAIL_ERROR:
			return { ...state, ...{ isLoading: false, error: action.error, token: null }}
		default:
			return state;
	}
}
