import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getFiles, selectFile, deleteFile } from '../actions/index';
import FileListCell from '../components/file_list_cell';
import '../css/files_list_view.css';

class FilesListView extends Component {
	componentDidMount() {
		this.props.getFiles();
	}

	render() {
		const cells = this.props.files.map(file => {
			return (
				<li
					key={file.id}
					onClick={() => { this.props.selectFile(file) }}
				>
					<FileListCell
						file={file}
						isSelected={file.id === this.props.selectedFile}
						deleteHandler={() => this.props.deleteFile(file.id)}
					/>
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
	return { files: state.files.files, isLoading: state.files.isLoading, error: state.files.error, selectedFile: state.files.selectedFileID};
}

export default connect( mapStateToProps, { getFiles, selectFile, deleteFile })(FilesListView);
