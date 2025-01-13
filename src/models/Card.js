export default class Card {
	constructor(suit, rank) {
		this.suit = suit
		this.rank = rank
	}

	isTrump(trumpSuit) {
		return this.suit === trumpSuit
	}

	isGreaterThan(card) {
		return this.rank > card.rank && this.suit === card.suit || this.isTrump(card.suit)
	}
}
