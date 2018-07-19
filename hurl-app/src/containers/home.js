import React, { Component } from 'react';
import { connect } from 'react-redux';
import { upload } from '../actions/index';
import FilesListView from '../components/files_list_view';

class Home extends Component {
	constructor(props) {
		super(props);
		if (!props.isLoggedIn) {
			this.props.history.push('/login');
		}
	}

	uploadFile(files) {
		if (!files || files.length === 0) {
			// TODO: Show error
			return;
		}
		this.props.upload(files[0]);
	}


	render() {
		return (
			<div id='home-container'>
				<input type='file' onChange={(event) => {
				this.uploadFile(event.target.files) }}></input>
				<FilesListView />
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
	return { isLoggedIn: state.auth.isLoggedIn };
}

export default connect(mapStateToProps, { upload })(Home);
