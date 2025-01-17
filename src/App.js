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
  useEffect(() => {
    //Инициализация игры
    deck.shuffle() //Перемешать колоду перед раздачей
    player.draw(deck)
    bot.draw(deck)

    //Определить козырь
    const trumpCard = deck.draw()
    setTrumpSuit(trumpCard.suit)
    deck.cards.push(trumpCard)
  }, [deck, player, bot])

  useEffect(() => {
    if (isPlayerTurn) return
    setTimeout(() => {
      botTurn() //ход бота, если его очередь кароч
    }, 500)

  }, [isPlayerTurn])

  function checkCanCover(card, lastCard, trumpSuit) {
    if (!card || typeof card !== 'object') {
      return false
    }
    if (lastCard && lastCard.isTrump(trumpSuit) && !card.isTrump(trumpSuit)) {
      return true // Последняя карта была козырем, а текущая - нет
    }
    if (lastCard && lastCard.suit === card.suit) {
      return lastCard.rank < card.rank // Последняя карта той же масти, но младше
    }
    return false // Никаких совпадений
  }


  const drawCards = (player, deck) => {
    while (player.hand.cards.length < 6 && deck.cards.length > 0) {
      const drawnCard = deck.cards.pop() // Берем карту из конца колоды
      player.hand.cards.push(drawnCard) // Добавляем карту в руку игрока
    }
  }
  const attack = (card) => {
    // Проверяем, пусто ли поле и игрок начинает ход
    if (!currentCard) {
      setCurrentCard(card)
      setFieldCards([card])
      player.hand.cards = player.hand.cards.filter(c => c !== card) // Удалить карту из руки игрока

      const isGameOver = checkGameOver()
      if (isGameOver) return

      setIsPlayerTurn(false)
    } else {
      const lastCard = currentCard

      // Проверка на возможность защиты
      const canCover = checkCanCover(card, lastCard, trumpSuit)

      if (canCover) {
        setFieldCards([card])
        player.hand.cards = player.hand.cards.filter(c => c !== card) //Удалить карту из руки игрока


        const isGameOver = checkGameOver()
        if (isGameOver) return


        setIsPlayerTurn(false) // Теперь ход бота
      } else {
        alert("Вы не можете крыть этой картой!")
      }
    }
  }


  const botAttack = () => {
    // кароч чтобы бот атаковал после успешной защиты
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


      const isGameOver = checkGameOver()
      if (isGameOver) return

      setIsPlayerTurn(true)
    }
  }

  const defend = (card) => {
    const lastCard = fieldCards[fieldCards.length - 1]

    // Проверка для успешной защиты
    const canDefend = checkCanCover(card, lastCard, trumpSuit)



    if (canDefend) {
      //Удаление защищающей карты из руки игрока или бота
      if (player.hand.cards.includes(card)) {
        player.hand.cards = player.hand.cards.filter(c => c !== card)
      } else {
        bot.hand.cards = bot.hand.cards.filter(c => c !== card)
      }

      setCurrentCard(null)
      // Очищаем поле от карт
      setFieldCards([])
      // Передаем ход ботику
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

    const cardToPlay = bot.hand.cards.find(card => {
      if (typeof card !== 'object' || !card) return false
      return checkCanCover(card, lastCard, trumpSuit)
    })

    if (cardToPlay) {
      alert(`Бот бьёт картой:${cardToPlay.rank}${cardToPlay.suit}`)
      setFieldCards([...fieldCards, cardToPlay])
      defend(cardToPlay) // Бот защищается или атакует
    } else {
      // Если у бота нет подходящей карты, он собирает карты
      if (!isPlayerTurn) {
        alert("Бот не смог защититься! Бот берет все карты.")
      }
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
    if (fieldCards.length === 0) {
      alert('Нет карт на поле, которые можно забрать!')
      return
    }

    // Сначала добавляем карты с поля в руку игрока
    player.hand.cards.push(...fieldCards)
    fieldCards.forEach(card => {
      bot.hand.cards = bot.hand.cards.filter(c => c !== card) // Убрать соответствующие карты у бота
    })

    // Очищаем поле
    setFieldCards([])

    // Проверяем завершение игры
    const isGameOver = checkGameOver()
    if (isGameOver) {
      alert("Игра окончена!") // Добавьте дальнейшую логику завершения игры
      return
    }

    // Сбрасываем текущую карту (если это нужно в вашей игре)
    setCurrentCard(null)

    // Ход переходит к боту
    setIsPlayerTurn(false)
  }
  console.log(bot.hand.cards)

  return (
    <div className="container">
      <h1>Durak Game</h1>
      <p className="deck">Козырь: {trumpSuit}</p>
      <p className="status">{gameStatus}</p>

      {gameStatus === '' && (
        <>
          <p>Количество карт в колоде:{deck.cards.length}</p>
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
