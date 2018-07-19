import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getFiles } from '../actions/index';
import FileListCell from '../components/file_list_cell';
import { API_URL } from '../actions/index';
import '../css/files_list_view.css';

class FilesListView extends Component {
	componentDidMount() {
		this.props.getFiles();
	}

	render() {
		const cells = this.props.files.map(file => {
			var permanentTokens = file.tokens.filter(aToken => {
				return (aToken.type === 'permanent');
			});
			var token = null;
			if (permanentTokens.length > 0) {
				token = permanentTokens[0].value;
			}
			return (
				<li key={file.id} onClick={(e) => {
						if (token) {
							const url = API_URL + '/files/' + token;
							window.open(url);
						}
					}}>
					<FileListCell file={file} />
				</li>
			);
		});

		return (
			<div id='files-list-container'>
				<ul>
					{ cells }
				</ul>
			</div>
		);
	}
}

function mapStateToProps(state) {
	return { files: state.files.files, isLoading: state.files.isLoading, error: state.files.error };
}

export default connect( mapStateToProps, { getFiles })(FilesListView);
