import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getTokenDetails } from '../actions/index';
import '../css/download.css';
import { API_URL, tokenType } from '../actions/index';
import qs from 'qs';

class Download extends Component {
	constructor(props) {
		super(props)
		this.state = { password: '' }
	}
	componentDidMount() {
		var query = this.props.location.search.slice(1);
		var tokenID = "";
		if (query) {
			tokenID = qs.parse(query).token;
		}
		this.props.getTokenDetails(tokenID);
	}

	logoView() {
		return (
			<p className='brand-large fg-acc-light font-brand'>Hurl</p>
		);
	}

	loadingView() {
		return (
			<p className='fg-text-dark font-medium'>Your download will begin shortly</p>
		);
	}

	errorView(error) {
		return (
			<p className='fg-acc-dark font-medium'>{error.message}</p>
		);
	}

	componentDidUpdate(prevProps) {
		var token = this.props.token;
		if (!prevProps.token && token && token.type !== tokenType.password) {
			setTimeout(() => {
				document.getElementById('downloadLink').click();
			}, 2000);
		} 
	}

	render() {
		let contentView = <div />
		let description = "Your file should begin downloading automatically. If it doesn't, click the link below"
		if (this.props.isLoading) {
			contentView = this.loadingView();
		} else if (this.props.error) {
			contentView = this.errorView(this.props.error);
		} else if (this.props.token) {
			switch (this.props.token.type) {
				case tokenType.password: {
					const downloadURL = `${API_URL}/files/${this.props.token.value}?password=${this.state.password}`
					description = "Enter the password for this file and click Download"
					contentView = (
						<div id='download-password'>
							<input
								type='password'
								className='fg-acc-light bg-bg-light rounded border-acc-light font-normal'
								placeholder='Password'
								value={this.state.password}
								onChange={e => this.setState({...this.state, ...{ password: e.target.value }})}
								secure
							></input>
							<a id='download-button'
								className='fg-bg-light font-medium bg-acc-light rounded border-acc-light'
								href={downloadURL} download
							>
								Download
							</a>
						</div>
					)
					break
				}

				default: {
					const downloadURL = `${API_URL}/files/${this.props.token.value}`
					contentView = (
						<a
							id='downloadLink' className='fg-acc-light font-medium' href={downloadURL} download
						>
							Click to download
						</a>
					)
					break
				}
			}
		}

		return (
			<div id='download-container'>
				{this.logoView()}
				<div id='text-content'>
					<p id='dl-description' className='fg-text-dark bg-bg-light font-normal'>{description}</p>
					{contentView}
				</div>
			</div>
		);
	}
}

function mapStateToProps(state) {
	return { token: state.tokenDetail.token, isLoading: state.tokenDetail.isLoading, error: state.tokenDetail.error }
}

export default connect(mapStateToProps, { getTokenDetails })(Download);
