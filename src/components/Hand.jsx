import React from 'react'
import Card from './Card'

const Hand = ({ cards }) => {
	return (
		<div className="hand">
			{cards.map((card, index) => (
				<Card key={index} card={card} />
			))}
		</div>
	)
}

export default Hand
