import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getTokenDetails } from '../actions/index';
import '../css/download.css';
import { API_URL } from '../actions/index';
import qs from 'query-string';

class Download extends Component {
	componentDidMount() {
		var query = this.props.location.search;
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
		if (!prevProps.token && token && token.type === 'permanent') {
			setTimeout(() => {
				document.getElementById('downloadLink').click();
			}, 2000);
		} 
	}

	render() {
		var contentView = <div />
		if (this.props.isLoading) {
			contentView = this.loadingView();
		} else if (this.props.error) {
			contentView = this.errorView(this.props.error);
		} else if (this.props.token) {
			var downloadURL = API_URL + '/files/' + this.props.token.value;
			contentView = <a id='downloadLink' className='fg-acc-light font-medium' href={downloadURL} download>Click to download</a>
		}

		return (
			<div id='download-container'>
				{this.logoView()}
				<div id='text-content'>
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
