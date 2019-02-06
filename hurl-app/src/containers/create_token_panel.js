import React, { Component } from 'react';
import '../css/create_token_panel.css';
import { TOKEN_TYPE_ONCE, TOKEN_TYPE_TIMED, TOKEN_TYPE_PASSWORD, TOKEN_TYPE_PERMANENT } from '../actions/index';

class CreateTokenPanel extends Component {
	constructor(props) {
		super(props);
		this.state = { description: '', selectedType: TOKEN_TYPE_PERMANENT }
	}

	tokenInfoForType(tokenType) {
		switch (tokenType) {
			case TOKEN_TYPE_PERMANENT:
				return 'Permanent links do not expire automatically and do not require a password';
			case TOKEN_TYPE_ONCE:
				return 'One-time links expire immediately after the file is downloaded once';
			case TOKEN_TYPE_TIMED:
				return 'Timed links expire after a set duration';
			case TOKEN_TYPE_PASSWORD:
				return 'Links do not expire automatically. A password is required to download the file';
			default: 
				return '';
		}
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

				{/* Token info */}
				<div id='token-info' className={`fg-text-dark font-normal`}>
					{this.tokenInfoForType(this.state.selectedType)}
				</div>

				{/* Timed token */}
				<div id='time-selector-container'>
				</div>

				{/* Description */}
				<div id='token-description'>
					<input type='text' placeholder='Link description' className={`bg-bg-light fg-text-dark font-normal rounded border-acc-dark`}></input>
				</div>


				{/* Create Button */}
				<div id='create-button'>
					<button className={`fg-acc-dark font-bold bg-bg-dark`}>CREATE LINK</button>
				</div>
			</div>
		);
	}
}

export default CreateTokenPanel;
