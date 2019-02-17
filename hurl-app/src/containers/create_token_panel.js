import React, { Component } from 'react';
import { connect } from 'react-redux';
import '../css/create_token_panel.css';
import { TOKEN_TYPE_ONCE, TOKEN_TYPE_TIMED, TOKEN_TYPE_PASSWORD, TOKEN_TYPE_PERMANENT, createToken } from '../actions/index';

class CreateTokenPanel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			description: '',
			selectedType: TOKEN_TYPE_PERMANENT,
			password: '',
			selectedTimeUnit: 'min',
			duration: '30'
		}
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
		if (this.state.selectedType === TOKEN_TYPE_PASSWORD) {
			if (this.state.password.length === 0) { return }
		}
		let duration = Number(this.state.duration) || 30
		switch (this.state.selectedTimeUnit) {
			case 'min':
				duration = duration * 60
				break
			case 'hour':
				duration = duration * 60 * 60
				break
			case 'day':
				duration = duration * 60 * 60 * 24
				break
			default:
				break
		}
		this.props.createToken(this.props.fileID, this.state.selectedType, this.state.description, this.state.password, duration);
	}

	render() {
		const timeUnitSelectedClass = 'bg-acc-light fg-bg-light rounded border-acc-light duration-segment'
		const timeUnitClass = 'bg-bg-light fg-acc-light rounded border-acc-light duration-segment'
		const timerField = (this.state.selectedType === TOKEN_TYPE_TIMED) ?
		(
			<div id='create-meta-duration-container'>
				<input type='text' className={'bg-bg-light fg-acc-light rounded border-text-light'} value={this.state.duration}
					onChange={(e) => this.setState({...this.state, ...{ duration: e.target.value }}) }
				></input>
				<div className={this.state.selectedTimeUnit === 'min' ? timeUnitSelectedClass : timeUnitClass}
					onClick={e => this.setState({...this.state, ...{ selectedTimeUnit: 'min' }})}
				>min</div>
				<div className={this.state.selectedTimeUnit === 'hour' ? timeUnitSelectedClass : timeUnitClass}
					onClick={e => this.setState({...this.state, ...{ selectedTimeUnit: 'hour' }})}
				>hour</div>
				<div className={this.state.selectedTimeUnit === 'day' ? timeUnitSelectedClass : timeUnitClass}
					onClick={e => this.setState({...this.state, ...{ selectedTimeUnit: 'day' }})}
				>day</div>
			</div>
		) : (<div />)
		const passwordField = (this.state.selectedType === TOKEN_TYPE_PASSWORD) ?
		(
			<div id='token-password'>
				<input type='text' placeholder='Password' 
					className={`bg-bg-light fg-acc-dark font-normal rounded border-acc-dark`}
					onChange={(e) => this.setState({...this.state, ...{ password: e.target.value }})}
					value={this.state.password}
				></input>
			</div>
		) : <div />
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
					{timerField}

					{/* Password Field */}
					{passwordField}

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
