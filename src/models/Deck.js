import Card from './Card'

export default class Deck {
	constructor() {
		this.cards = this.createDeck()
		this.shuffle()
	}

	createDeck() {
		const suits = ['♠️', '♥️', '♦️', '♣️']
		const ranks = Array.from({ length: 9 }, (_, i) => i + 6) // 6-14 (6,7,...,10,J,Q,K,A)
		const cards = []
		suits.forEach(suit => {
			ranks.forEach(rank => {
				cards.push(new Card(suit, rank))
			})
		})
		return cards
	}

	shuffle() {
		// Простая функция перемешивания
		this.cards.sort(() => Math.random() - 0.5)
	}

	draw() {
		return this.cards.pop()
	}
}
