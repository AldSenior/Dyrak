import Hand from './Hand'

export default class Player {
	constructor(name) {
		this.name = name
		this.hand = new Hand()
	}

	draw(deck) {
		while (this.hand.cards.length < 6 && deck.cards.length > 0) {
			this.hand.add(deck.draw())
		}
	}
}
