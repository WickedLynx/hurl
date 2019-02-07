import React, { Component } from 'react';
import { connect } from 'react-redux';
import TokenCell from '../components/token_cell';
import CreateTokenPanel from './create_token_panel';
import { deleteToken } from '../actions/index';
import '../css/tokens_pane.css';

class TokensPane extends Component {
	render() {
		if (!this.props.selectedFile) {
			return <div />
		}
		var tokens = this.props.selectedFile.tokens || [];
		var cells = tokens.map (token => {
			var link = window.location.protocol + '//' + window.location.host + '/download?token=' + token.value;
			return (
				<li key={token.id}>
					<TokenCell link={link} notes={token.notes} type={token.type}
						dateCreated={token.date_created} dateExpires='--'
						deleteHandler={() => this.props.deleteToken(token.value)}
					/>
				</li>
			);
		});

		return (
			<div id='tokens-pane-container'>
				<CreateTokenPanel />
				<div id='tokens-pane'>
					<ul>
						{cells}
					</ul>
				</div>
			</div>
		);
	}
}

function mapStateToProps(state) {
	var files = state.files.files || [];
	var selectedFileID = state.files.selectedFileID || "";
	var selectedFiles = files.filter( file => { return file.id === selectedFileID } );
	var selectedFile = null;
	if (selectedFiles.length > 0) {
		selectedFile = selectedFiles[0];
	}
	return { selectedFile: selectedFile }
}

export default connect(mapStateToProps, { deleteToken })(TokensPane);
