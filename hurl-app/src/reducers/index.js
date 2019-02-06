import { combineReducers } from 'redux';
import authReducer from './auth_reducer';
import filesReducer from './files_reducer';
import tokenDetailReducer from './token_detail_reducer';
import createTokenReducer from './create_token_reducer';

const rootReducer = combineReducers({
	auth: authReducer,
	files: filesReducer,
	tokenDetail: tokenDetailReducer,
	createToken: createTokenReducer
});

export default rootReducer;
