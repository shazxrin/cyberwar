import GameState from "./gameState.ts"
import {Card} from "./card.ts"
import {Scores} from "./scores.ts"

type Game = {
    id: number,
    name: string,
    host: string,
    players: string[],
    isCanStart: boolean,
    state: GameState,
    playerTurn: string | null,
    playerCards: Card[],
    playersScores: Map<string, Scores>,
    discardPile: Card[],
    isAttackTarget: boolean
}

export default Game
