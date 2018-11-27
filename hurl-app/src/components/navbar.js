import React from 'react';

export default function NavBar(props) {
	return (
		<div className='navbar bg-bg-dark'>
			<span className='font-brand fg-acc-light brand-small interactive'>Hurl</span>
			<div className='button-container'>
				<label className='fg-acc-dark interactive font-medium'>
				<input type='file' onChange={ e => { props.uploadHandler(e.target.files)}}></input>
					Upload
				</label>
				<label className='fg-text-dark interactive font-normal'>Logout</label>
			</div>
		</div>
	);
}
