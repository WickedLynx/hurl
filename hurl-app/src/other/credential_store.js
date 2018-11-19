const tokenKey = 'hurl-token';

export default class CredentialStore {
	static token() {
		return window.localStorage.getItem(tokenKey);
	}

	static saveToken(token) {
		if (token && token.length > 0) {
			window.localStorage.setItem(tokenKey, token);
		}
	}

	static authHeader() {
		return { Authorization: 'Bearer ' + CredentialStore.token() };
	}

	static canAuthenticate() {
		var token = CredentialStore.token();
		if (token && token.length > 0) {
			return true;
		}
		return false;
	}

	static empty() {
		window.localStorage.removeItem(tokenKey);
	}
}
