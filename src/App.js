import React, { useEffect, useState } from 'react'
import './App.css'
import Field from './components/Field'
import Deck from './models/Deck'
import Player from './models/Player'

const App = () => {
  const [deck, setDeck] = useState(new Deck())
  const [player, setPlayer] = useState(new Player('Player'))
  const [bot, setBot] = useState(new Player('Bot'))
  const [fieldCards, setFieldCards] = useState([])
  const [currentCard, setCurrentCard] = useState(null)
  const [trumpSuit, setTrumpSuit] = useState(null)
  const [gameStatus, setGameStatus] = useState('')
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [canDrawCard, setCanDrawCard] = useState(false)
  useEffect(() => {
    // Инициализация игры
    deck.shuffle() // Перемешать колоду перед раздачей
    player.draw(deck)
    bot.draw(deck)

    // Определить козырь
    const trumpCard = deck.draw()
    setTrumpSuit(trumpCard.suit)
    deck.cards.push(trumpCard) // Возврат козыря обратно в колоду
  }, [deck, player, bot])

  useEffect(() => {
    if (isPlayerTurn) return // Если ход игрока, ничего не делать
    setTimeout(() => {
      botTurn() // Иначе, делать ход бота
    }, 500)

  }, [isPlayerTurn]) // Это вызывается, когда isPlayerTurn изменяется

  const drawCards = (player, deck) => {
    while (player.hand.cards.length < 6 && deck.cards.length > 0) {
      const drawnCard = deck.cards.pop() // Берем карту из конца колоды
      player.hand.cards.push(drawnCard) // Добавляем карту в руку игрока
    }
  }
  const updateCanDrawCard = () => {
    // Проверка, может ли игрок взять карту
    const lastCard = currentCard
    const canCover = player.hand.cards.some(card =>
      (card.isGreaterThan(lastCard) && card.suit === lastCard.suit) ||
      (card.isTrump(trumpSuit) && !lastCard.isTrump(trumpSuit)) ||
      (card.isTrump(trumpSuit) && lastCard.isTrump(trumpSuit) && card.isGreaterThan(lastCard))
    )

    setCanDrawCard(!canCover) // Игрок может тянуть карту, если не может покрыть
  }
  const attack = (card) => {
    // Проверяем, пусто ли поле и игрок начинает ход
    if (!currentCard) {
      setCurrentCard(card)
      setFieldCards([card])
      player.hand.cards = player.hand.cards.filter(c => c !== card) // Удалить карту из руки игрока

      // Проверяем, проиграл ли игрок после атаки
      const isGameOver = checkGameOver()
      if (isGameOver) return

      // Обновляем очередь на ход
      setIsPlayerTurn(false) // Теперь ход бота
    } else {
      const lastCard = currentCard // Последняя карта на столе

      // Проверка на возможность крытия
      const canCover =
        (card.isGreaterThan(lastCard) && card.suit === lastCard.suit) ||  // Сильная карта той же масти
        (card.isTrump(trumpSuit) && !lastCard.isTrump(trumpSuit)) ||  // Козырь против некозыря
        (card.isTrump(trumpSuit) && lastCard.isTrump(trumpSuit) && card.isGreaterThan(lastCard))  // Сильный козырь против другого козыря

      if (canCover) {
        setFieldCards([card])
        player.hand.cards = player.hand.cards.filter(c => c !== card) // Удалить карту из руки игрока

        // Проверяем, проиграл ли игрок после атаки
        const isGameOver = checkGameOver()
        if (isGameOver) return


        // Обновляем очередь на ход
        setIsPlayerTurn(false) // Теперь ход бота
      } else {
        alert("Вы не можете крыть этой картой!")
      }
    }
  }


  const botAttack = () => {
    // Логика для того, чтобы бот атаковал после успешной защиты
    const cardToAttack = bot.hand.cards[Math.floor(Math.random() * bot.hand.cards.length)]

    if (cardToAttack) {
      alert(`Бот атакует картой: ${cardToAttack.rank}${cardToAttack.suit}`)
      setTimeout(() => {
        setFieldCards([cardToAttack])
        setCurrentCard(cardToAttack)
        setIsPlayerTurn(true)
      }, 500)

    } else {
      alert("Бот не может атаковать и берёт карты с поля.")
      bot.hand.cards.push(...fieldCards) // Бот берет все карты с поля
      setFieldCards([])
      setCurrentCard(null)

      // Проверка завершения игры
      const isGameOver = checkGameOver()
      if (isGameOver) return

      // Теперь ход игрока
      setIsPlayerTurn(true)
    }
  }

  const defend = (card) => {
    const lastCard = fieldCards[fieldCards.length - 1]

    // Проверка для успешной защиты
    const canDefend =
      (card.isGreaterThan(lastCard) && card.suit === lastCard.suit) || // Сильная карта той же масти
      (card.isTrump(trumpSuit) && !lastCard.isTrump(trumpSuit)) || // Козырь против некозыря
      (card.isTrump(trumpSuit) && lastCard.isTrump(trumpSuit) && card.isGreaterThan(lastCard)) // Сильный козырь против другого козыря



    if (canDefend) {
      // Удаление защищающей карты из руки игрока или бота
      if (player.hand.cards.includes(card)) {
        player.hand.cards = player.hand.cards.filter(c => c !== card)
      } else {
        bot.hand.cards = bot.hand.cards.filter(c => c !== card)
      }

      setCurrentCard(null) // Обнуляем текущую карту

      // Очищаем поле от карт
      setFieldCards([])

      // Ход бота после успешной защиты

      botAttack()
    } else {
      // Игрок или бот берет все карты с поля
      if (player.hand.cards.includes(card)) {
        player.hand.cards.push(...fieldCards)
        alert("Защита не удалась! Вы берете все карты с поля.")
      } else {
        bot.hand.cards.push(...fieldCards)
        alert("Бот не может покрыть, Он берет все карты с поля.")
      }
      setFieldCards([]) // Очищаем поле
      setCurrentCard(null) // Сбрасываем текущую карту

      // Проверка на окончание игры
      const isGameOver = checkGameOver()
      if (isGameOver) return

      // Теперь ход игрока
      setIsPlayerTurn(true)
    }
  }


  const botTurn = () => {
    if (!currentCard) {
      botAttack()
    }

    const lastCard = fieldCards[fieldCards.length - 1]
    const cardToPlay = bot.hand.cards.find(card =>
      (card.isGreaterThan(lastCard) && card.suit === lastCard.suit) || // Сильная карта той же масти
      (card.isTrump(trumpSuit) && !lastCard.isTrump(trumpSuit)) || // Козырь против некозыря
      (card.isTrump(trumpSuit) && lastCard.isTrump(trumpSuit) && card.isGreaterThan(lastCard))  // Сильный козырь против другого козыря
    )

    if (cardToPlay) {
      alert(`Бот бьёт картой:${cardToPlay.rank}${cardToPlay.suit}`)
      setFieldCards([...fieldCards, cardToPlay])
      defend(cardToPlay) // Бот защищается или атакует
    } else {
      // Если у бота нет подходящей карты, он собирает карты

      alert("Бот не смог защититься! Бот берет все карты.")
      bot.hand.cards.push(...fieldCards) // Бот берет все карты
      setFieldCards([])
      setCurrentCard(null)

      // Проверка завершения игры
      checkGameOver()

      // Ход переходит к игроку

      setIsPlayerTurn(true)
    }
  }

  const checkGameOver = () => {
    if (player.hand.cards.length === 0) {
      setGameStatus("Игрок выиграл!")
      return true
    } else if (bot.hand.cards.length === 0) {
      setGameStatus("Бот выиграл!")
      return true
    }
    return false
  }
  useEffect(() => {
    drawCards(player, deck)
    drawCards(bot, deck)

  }, [player.hand.cards.length, bot.hand.cards.length, deck])
  const takeCardFromBot = () => {
    // Проверка наличия карт на поле
    if (fieldCards.length === 0) {
      alert('Нет карт на поле, которые можно забрать у бота!')
      return
    }

    // Сначала добавляем карты с поля в руку игрока
    player.hand.cards.push(...fieldCards)
    setFieldCards([]) // Очищаем поле

    // Проверка завершения игры
    const isGameOver = checkGameOver()
    if (isGameOver) {
      // Если игра закончена, можно добавить логику завершения - например, уведомление или переход к экрану окончания игры
      alert("Игра окончена!") // Можно адаптировать под ваши нужды
      return
    }

    // Сбрасываем текущую карту (если это нужно в вашей игре)
    setCurrentCard(null)

    // Ход переходит к боту
    setIsPlayerTurn(false)
  }
  console.log(isPlayerTurn)


  return (
    <div className="container">
      <h1>Durak Game</h1>
      <p className="deck">Козырь: {trumpSuit}</p>
      <p className="status">{gameStatus}</p>

      {gameStatus === '' && (
        <>
          <h3>Игрок</h3>
          <Field cards={fieldCards} />

          {currentCard ? (
            <div>
              {isPlayerTurn ? (
                <>
                  {player.hand.cards.map((card, index) => (
                    <div className="card" key={index} onClick={() => isPlayerTurn && attack(card)}>
                      {card.rank} {card.suit}
                    </div>

                  ))}
                  <button onClick={takeCardFromBot}>Взять карты с поля</button>
                </>
              ) : (
                <div>
                  <p>Ход бота, подождите...</p>

                </div>
              )}
            </div>
          ) : (
            <>
              {player.hand.cards.map((card, index) => (
                <div className="card" key={index} onClick={() => isPlayerTurn && attack(card)}>
                  {card.rank} {card.suit}
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default App
