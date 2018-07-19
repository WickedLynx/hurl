import React from 'react';
import '../css/file_list_cell.css';
import bytes from 'bytes';

export default function FileListCell(props) {
	var date = new Date(props.file.date_created);
	return (
		<div className='file-list-cell-container background-light font-primary medium-border'>
			<p className='file-name color-dark'>{props.file.name}</p>
			<p className='file-meta font-secondary color-ultra-dark'>
				<span className='file-size'>{ bytes(props.file.size || 0)}</span>
				<span className='dot'>⁙⁙⁙</span>
				<span className='file-date'>{date.toDateString()}</span>
			</p>
		</div>
	);

}
