import React from 'react'
import Card from './Card'

const Field = ({ cards }) => {
	return (
		<div className="field">
			{cards.map((card, index) => (
				<Card key={index} card={card} />
			))}
		</div>
	)
}

export default Field
