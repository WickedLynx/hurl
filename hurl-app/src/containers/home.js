import React, { Component } from 'react';
import { connect } from 'react-redux';
import { upload } from '../actions/index';
import { getFiles } from '../actions/index';
import FileListCell from '../components/file_list_cell';
import { API_URL } from '../actions/index';

class Home extends Component {
	constructor(props) {
		super(props);
		if (!props.isLoggedIn) {
			this.props.history.push('/login');
		}
	}

	componentDidMount() {
		this.props.getFiles();
	}

	uploadFile(files) {
		if (!files || files.length === 0) {
			// TODO: Show error
			return;
		}
		this.props.upload(files[0]);
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
					<FileListCell name={file.name} />
				</li>
			);
		});

		return (
			<div id='home-container'>
				<input type='file' onChange={(event) => {
				this.uploadFile(event.target.files) }}></input>
				<div>
					<ul>
						{cells}
					</ul>
				</div>
			</div>
		);
	}

	componentDidUpdate(prevProps) {
		if (!this.props.isLoggedIn && prevProps.isLoggedIn !== this.props.isLoggedIn) {
			this.props.history.push('/login');	
		}
	}
}

function mapStateToProps(state) {
	return { isLoggedIn: state.auth.isLoggedIn, files: state.files.files };
}

export default connect(mapStateToProps, { upload, getFiles })(Home);
