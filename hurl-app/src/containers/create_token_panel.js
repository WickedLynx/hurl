import React, { Component } from 'react';
import { connect } from 'react-redux';
import '../css/create_token_panel.css';
import { TOKEN_TYPE_ONCE, TOKEN_TYPE_TIMED, TOKEN_TYPE_PASSWORD, TOKEN_TYPE_PERMANENT, createToken } from '../actions/index';

class CreateTokenPanel extends Component {
	constructor(props) {
		super(props);
		this.state = { description: '', selectedType: TOKEN_TYPE_PERMANENT }
		this.createToken = this.createToken.bind(this);
	}

	tokenInfoForType(tokenType) {
		switch (tokenType) {
			case TOKEN_TYPE_PERMANENT:
				return 'Link does not expire automatically and does not require a password';
			case TOKEN_TYPE_ONCE:
				return 'Link expires immediately after the file is downloaded';
			case TOKEN_TYPE_TIMED:
				return 'Link expires automatically after a set duration';
			case TOKEN_TYPE_PASSWORD:
				return 'Link does not expire automatically. A password is required to download the file';
			default: 
				return '';
		}
	}

	createToken() {
		this.props.createToken(this.props.fileID, this.state.selectedType, this.state.description, this.state.password, this.state.duration);
	}

	render() {
		return (
			<div id='create-token-container' className={`rounded bg-bg-dark border-text-light`}>
				{/* Selector */}
				<div id='token-type-selector' className={`font-medium fg-text-dark`}>
					<div className={this.state.selectedType === TOKEN_TYPE_PERMANENT ? 'fg-acc-dark' : ''}
						onClick={() => this.setState({...this.state, ...{ selectedType: TOKEN_TYPE_PERMANENT }})}
					>
						PERMANENT
					</div>
					<div className={this.state.selectedType === TOKEN_TYPE_ONCE ? 'fg-acc-dark' : ''}
						onClick={() => this.setState({...this.state, ...{ selectedType: TOKEN_TYPE_ONCE }})}
					>
						ONE-TIME
					</div>
					<div className={this.state.selectedType === TOKEN_TYPE_TIMED ? 'fg-acc-dark' : ''}
						onClick={() => this.setState({...this.state, ...{ selectedType: TOKEN_TYPE_TIMED }})}
					>
						TIMED
					</div>
					<div className={this.state.selectedType === TOKEN_TYPE_PASSWORD ? 'fg-acc-dark' : ''}
						onClick={() => this.setState({...this.state, ...{ selectedType: TOKEN_TYPE_PASSWORD }})}
					>
						PASSWORD
					</div>
				</div>

				<div id='create-token-meta'>
					{/* Token info */}
					<div id='token-info' className={`fg-text-dark font-normal`}>
						{this.tokenInfoForType(this.state.selectedType)}
					</div>

					{/* Timed token */}
					<div id='time-selector-container'>
					</div>

					{/* Description */}
					<div id='token-description'>
						<input type='text' placeholder='Link description' 
							className={`bg-bg-light fg-text-dark font-normal rounded border-acc-dark`}
							onChange={(e) => this.setState({...this.state, ...{ description: e.target.value }})}
							value={this.state.description}
						></input>
					</div>
				</div>

				{/* Create Button */}
				<div id='create-button'>
					<button className={`fg-acc-dark font-bold bg-bg-dark`}
						onClick={this.createToken}>
						CREATE LINK
					</button>
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state) => (
	{ isLoading: state.createToken.isLoading, success: state.createToken.success, error: state.createToken.error, fileID: state.files.selectedFileID }
)

export default connect(mapStateToProps, { createToken })(CreateTokenPanel);
