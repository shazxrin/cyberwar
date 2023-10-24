import {Card} from "./card.ts"
import {Scores} from "./scores.ts"

export type Event = {
    type: string
}

export type ServerEvent = Event & {
    result: boolean
}

export type SignInEvent = Event & {
    type: "signin",
    playerName: string
}

export type SignInServerEvent = ServerEvent & {
    type: "signin",
    playerName: string
}

export type CreateEvent = Event & {
    type: "create",
    gameName: string,
}

export type CreateServerEvent = ServerEvent & {
    type: "create",
    gameId: number,
    gameName: string,
}

export type JoinEvent = Event & {
    type: "join",
    gameId: number
}

export type JoinServerEvent = ServerEvent & {
    type: "join",
    playerJoin: string,
    gameId: number,
    gameName: string,
    host: string,
    players: string[],
    isCanStart: boolean
}

export type SearchEvent = Event & {
    type: "search"
}

export type SearchServerEvent = ServerEvent & {
    type: "search",
    rooms: {
        gameId: number,
        gameName: string,
        playerCount: number,
        isFull: boolean,
    }[]
}

export type LeaveEvent = Event & {
    type: "leave"
}

export type LeaveServerEvent = ServerEvent & {
    type: "leave",
    playerLeave: string,
    gameId: number,
    gameName: string,
    host: string,
    players: string[],
    isCanStart: boolean
}

export type StartEvent = Event & {
    type: "start"
}

export type StartServerEvent = ServerEvent & {
    type: "start"
}

export type PlayEvent = Event & {
    type: "play",
    action: string
}

export type PlayServerEvent = ServerEvent & {
    type: "play"
    action: string
}

export type AttackPlayEvent = PlayEvent & {
    action: "attack",
    cardId: number
}

export type AttackPlayServerEvent = PlayServerEvent & {
    action: "attack",
    playerAttack: string,
    playerTarget: string,
    card: Card
}

export type CounterPlayEvent = PlayEvent & {
    action: "counter",
    cardId: number
}

export type CounterPlayServerEvent = PlayServerEvent & {
    action: "counter",
    playerCounter: string,
    card: Card,
    playersScores: Map<string, Scores>
}

export type DefendPlayEvent = PlayEvent & {
    action: "defend",
    cardId: number
}

export type DefendPlayServerEvent = PlayServerEvent & {
    action: "defend",
    playerDefend: string,
    card: Card,
    playersScores: Map<string, Scores>
}

export type DrawPlayServerEvent = PlayServerEvent & {
    action: "draw",
    cards: Card[]
}

export type EndPlayServerEvent = PlayServerEvent & {
    action: "end",
    playerWin: string,
}

export type SkipPlayEvent = PlayEvent & {
    action: "skip"
}

export type SkipPlayServerEvent = PlayServerEvent & {
    action: "skip",
    playerSkip: string,
    playersScores: Map<string, Scores>
}

export type TurnPlayServerEvent = PlayServerEvent & {
    action: "turn",
    playerTurn: string
}
