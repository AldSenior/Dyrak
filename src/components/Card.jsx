import React from 'react'

const Card = ({ card }) => {
	return (
		<div className="card">
			{card.rank} {card.suit}
		</div>
	)
}

export default Card
