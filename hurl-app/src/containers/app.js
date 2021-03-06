import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Login from './login';
import Home from './home';
import Download from './download';
import { connect } from 'react-redux';

class App extends Component {
	render() {
		const baseName = process.env.REACT_APP_BASENAME || '/'
		return(
			<div id='root-container'>
				<Router basename={baseName}>
					<div>
						<Switch>
						<Route exact path='/' component={Home} />
						<Route exact path='/login' component={Login} />
						<Route exact path='/download' component={Download} />
						</Switch>
					</div>
				</Router>
			</div>
		);
	}
}

function mapStateToProps(state) {
	return state;
}

export default connect(mapStateToProps)(App);
