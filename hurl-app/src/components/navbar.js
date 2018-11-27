import React from 'react';

export default function NavBar() {
	return (
		<div className='navbar bg-bg-dark'>
			<span className='font-brand fg-acc-light brand-small interactive'>Hurl</span>
			<div className='button-container'>
				<span className='fg-acc-dark interactive font-medium'>Upload</span>
				<span className='fg-text-dark interactive font-normal'>Logout</span>
			</div>
		</div>
	);
}
