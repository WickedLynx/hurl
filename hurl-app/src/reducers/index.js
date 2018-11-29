import { combineReducers } from 'redux';
import authReducer from './auth_reducer';
import filesReducer from './files_reducer';
import tokenDetailReducer from './token_detail_reducer';

const rootReducer = combineReducers({
	auth: authReducer,
	files: filesReducer,
	tokenDetail: tokenDetailReducer
});

export default rootReducer;
