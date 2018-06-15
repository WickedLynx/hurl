import { AUTH_SUCCESS, AUTH_LOADING, AUTH_ERROR } from '../actions/index';
import CredentialStore from '../other/credential_store';

const INITIAL_STATE = {
	isLoggedIn: false,
	isLoading: false,
	error: null
};

export default function authReducer(state=INITIAL_STATE, action) {
	var isLoggedIn = CredentialStore.canAuthenticate();
	switch (action.type) {
		case AUTH_SUCCESS:
			var token = action.data.token;
			CredentialStore.saveToken(token);
			isLoggedIn = CredentialStore.canAuthenticate();
			return { isLoggedIn: isLoggedIn, isLoading: false, error: null };
		case AUTH_LOADING:
			return { isLoggedIn: isLoggedIn, isLoading: true, error: null };
		case AUTH_ERROR:
			return { isLoggedIn: isLoggedIn, isLoading: false, error: action.error };
		default:
			return { ...state, ...{ isLoggedIn: isLoggedIn } };
	}
}
