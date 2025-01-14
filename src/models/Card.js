export default class Card {
	constructor(suit, rank) {
		this.suit = suit
		this.rank = rank
	}
	isTrump(trumpSuit) {
		if (!this) {
			throw new Error('Контекст this потерян')
		}
		return this.suit === trumpSuit
	}
	isGreaterThan(card) {
		// Проверка, передан ли валидный объект карты
		if (!card || typeof card !== 'object') {
			return false // Если не валидная карта, не рассматриваем её в сравнении
		}

		if (this.isTrump(card.suit) && !card.isTrump(this.suit)) {
			return true // Текущая карта - козырь, а карта противника - нет
		}

		if (this.suit === card.suit) {
			return this.rank > card.rank // Одинаковая масть, сравниваем по рангу
		}

		return false // Разные масти и не козыри
	}


}
