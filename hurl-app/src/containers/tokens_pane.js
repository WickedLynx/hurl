import React, { Component } from 'react';
import { connect } from 'react-redux';
import TokenCell from '../components/token_cell';
import { API_URL } from '../actions/index';
import '../css/tokens_pane.css';

class TokensPane extends Component {
	render() {
		var tokens = this.props.selectedFile.tokens || [];
		var cells = tokens.map (token => {
			var link = API_URL + '/files/' + token.value
			return (
				<li key={token.id}>
				<TokenCell link={link} type={token.type} dateCreated={token.date_created} dateExpires='--' />
				</li>
			);
		});

		return (
			<div id='tokens-pane-container'>
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
	var selectedFile = {};
	if (selectedFiles.length > 0) {
		selectedFile = selectedFiles[0];
	}
	return { selectedFile: selectedFile }
}

export default connect(mapStateToProps)(TokensPane);
