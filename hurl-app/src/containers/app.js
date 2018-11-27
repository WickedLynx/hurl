import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Login from './login';
import Home from './home';
import { connect } from 'react-redux';
import '../css/app.css';

class App extends Component {
	render() {
		return(
			<div id='root-container'>
				<Router baseName={'/'}>
					<div>
						<Switch>
							<Route exact path='/' component={Home} />
							<Route exact path='/login' component={Login} />
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
