import React, { Component } from 'react';
import { connect } from 'react-redux';

class Home extends Component {
	constructor(props) {
		super(props);
		if (!props.isLoggedIn) {
			this.props.history.push('/login');
		}
	}

	render() {
		return (
			<div>
				<p>Welcome Home!</p>
			</div>
		);
	}

	componentDidUpdate(prevProps) {
		if (!this.props.isLoggedIn && prevProps.isLoggedIn !== this.props.isLoggedIn) {
			this.props.history.push('/login');	
		}
	}
}

function mapStateToProps(state) {
	return { isLoggedIn: state.auth.isLoggedIn };
}

export default connect(mapStateToProps)(Home);
