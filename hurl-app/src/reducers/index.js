import { combineReducers } from 'redux';
import authReducer from './auth_reducer';
import filesReducer from './files_reducer';

const rootReducer = combineReducers({
	auth: authReducer,
	files: filesReducer
});

export default rootReducer;
