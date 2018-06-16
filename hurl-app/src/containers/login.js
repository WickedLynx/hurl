import React, { Component } from 'react';
import { connect } from 'react-redux';
import { login } from '../actions/index';
import '../css/login.css';

class Login extends Component {
	constructor(props) {
		super(props);
		this.state = { email: "", password: "" };
	}

	login() {
		var email = this.state.email;
		var password = this.state.password;

		if (email && email.length > 0 && password && password.length > 0) {
			this.props.login(email, password);
		} else {
			// TODO: Show error
		}
	}
		

	render() {
		return (
			<div id='login-container' className='background-light rounded-corners'>
				<input type='email' placeholder='Email address' onChange={(event) => {
					this.setState({...this.state, ...{ email: event.target.value }})
				}} value={ this.state.email } className='medium-border rounded-corners font-primary color-dark'></input>
				<input type='password' placeholder='Password' onChange={(event) => {
					this.setState({...this.state, ...{ password: event.target.value }})
				}} value={ this.state.password } className='medium-border rounded-corners font-primary color-dark'></input>
				<button onClick={ this.login.bind(this) } className='button-primary'>LOGIN</button>
			</div>
		);
	}

	componentDidUpdate(prevProps) {
		var isLoggedIn = this.props.isLoggedIn;

		if (isLoggedIn) {
			this.props.history.push('/');
		}
	}

}

function mapStateToProps(state) {
	return { isLoggedIn: state.auth.isLoggedIn, error: state.auth.error, isLoading: state.auth.isLoading };
}

export default connect(mapStateToProps, { login })(Login);
