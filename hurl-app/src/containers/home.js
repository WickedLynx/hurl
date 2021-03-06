import React, { Component } from 'react';
import { connect } from 'react-redux';
import { upload } from '../actions/index';
import FilesListView from '../components/files_list_view';
import NavBar from '../components/navbar';
import '../css/home.css';
import TokensPane from './tokens_pane';

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
				<NavBar uploadHandler={files => { this.uploadFile(files) }}/>
				<div id='home-content-container'>
					<div id='file-list-canvas'>
						<FilesListView />
					</div>
					<div id='token-list-canvas'>
						<TokensPane />
					</div>
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
	return { isLoggedIn: state.auth.isLoggedIn };
}

export default connect(mapStateToProps, { upload })(Home);
