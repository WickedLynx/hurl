import React from 'react';
import '../css/file_list_cell.css';
import bytes from 'bytes';
import TrashIcon from '../assets/trash_icon.png';

export default function FileListCell(props) {
	var date = new Date(props.file.date_created);
	return (
		<div className='file-list-cell-container bg-bg-dark rounded border-text-light interactive'>
			<p className='font-medium fg-text-dark'>{props.file.name}</p>
			<p className='font-normal fg-text-dark'>{date.toDateString()}</p>
			<p className='font-medium fg-text-dark'>{bytes(props.file.size || 0)}</p>
			<div className='trash-container'>
			<img src={TrashIcon} />
			</div>
		</div>
	);

}
