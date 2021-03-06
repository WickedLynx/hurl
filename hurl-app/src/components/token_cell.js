import React from 'react';
import TrashIcon from '../assets/trash_icon.png';

export default function TokenCell(props) {
	var date = new Date(props.dateCreated);
	return (
		<div className='token-cell-container rounded bg-bg-dark border-text-light'>
			<a href={props.link} className='fg-acc-light font-normal'>{props.link}</a>
			<p className='fg-text-dark font-medium'>{props.notes || '--'}</p>
			<p className='fg-text-dark font-normal'>
				{props.type + ' | ' + date.toDateString() }
			</p>
			<div className='trash-container interactive'>
				<img src={TrashIcon} alt='' onClick={props.deleteHandler}></img>
			</div>
		</div>
	);
}
