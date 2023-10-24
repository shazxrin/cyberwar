import {StateCreator} from "zustand"
import {
    AttackPlayEvent,
    AttackPlayServerEvent,
    CounterPlayEvent,
    CounterPlayServerEvent,
    CreateEvent,
    CreateServerEvent,
    DefendPlayEvent,
    DefendPlayServerEvent,
    DrawPlayServerEvent,
    EndPlayServerEvent,
    JoinEvent,
    JoinServerEvent,
    LeaveEvent,
    LeaveServerEvent,
    PlayServerEvent,
    SearchEvent,
    SearchServerEvent,
    ServerEvent,
    SignInEvent,
    SignInServerEvent,
    SkipPlayEvent,
    SkipPlayServerEvent,
    StartEvent,
    StartServerEvent,
    TurnPlayServerEvent
} from "../game/events.ts"
import {AppStore, EventSlice} from "./store"
import Game from "../game/game.ts"

const createEventSlice: StateCreator<AppStore, [], [], EventSlice> = (set, get) => ({
    error: null,
    handleServerEvent: (serverEvent: ServerEvent) => {
        console.debug(serverEvent)
        if (serverEvent.type == "signin") {
            const signInServerEvent = serverEvent as SignInServerEvent
            get().handleSignInServerEvent(signInServerEvent)
        } else if (serverEvent.type == "create") {
            const createServerEvent = serverEvent as CreateServerEvent
            get().handleCreateServerEvent(createServerEvent)
        } else if (serverEvent.type == "join") {
            const joinServerEvent = serverEvent as JoinServerEvent
            get().handleJoinServerEvent(joinServerEvent)
        } else if (serverEvent.type == "leave") {
            const leaveServerEvent = serverEvent as LeaveServerEvent
            get().handleLeaveServerEvent(leaveServerEvent)
        } else if (serverEvent.type == "search") {
            const searchServerEvent = serverEvent as SearchServerEvent
            get().handleSearchServerEvent(searchServerEvent)
        } else if (serverEvent.type == "start") {
            const startServerEvent = serverEvent as StartServerEvent
            get().handleStartServerEvent(startServerEvent)
        } else if (serverEvent.type == "play") {
            const playServerEvent = serverEvent as PlayServerEvent
            if (playServerEvent.action == "attack") {
                const attackPlayServerEvent = playServerEvent as AttackPlayServerEvent
                get().handleAttackPlayServerEvent(attackPlayServerEvent)
            } else if (playServerEvent.action == "counter") {
                const counterPlayServerEvent = playServerEvent as CounterPlayServerEvent
                get().handleCounterPlayServerEvent(counterPlayServerEvent)
            } else if (playServerEvent.action == "defend") {
                const defendPlayServerEvent = playServerEvent as DefendPlayServerEvent
                get().handleDefendPlayServerEvent(defendPlayServerEvent)
            } else if (playServerEvent.action == "draw") {
                const drawPlayServerEvent = playServerEvent as DrawPlayServerEvent
                get().handleDrawPlayServerEvent(drawPlayServerEvent)
            } else if (playServerEvent.action == "end") {
                const endPlayServerEvent = playServerEvent as EndPlayServerEvent
                get().handleEndPlayServerEvent(endPlayServerEvent)
            } else if (playServerEvent.action == "skip") {
                const skipPlayServerEvent = playServerEvent as SkipPlayServerEvent
                get().handleSkipPlayServerEvent(skipPlayServerEvent)
            } else if (playServerEvent.action == "turn") {
                const turnPlayServerEvent = playServerEvent as TurnPlayServerEvent
                get().handleTurnPlayServerEvent(turnPlayServerEvent)
            }
        }
    },
    sendSignInEvent: (playerName: string) => {
        if (!get().isWebSocketReady) {
            set((state) => ({...state, error: "Not connected to server. Try again later."}))
            return
        }

        set((state) => ({...state, playerName: playerName}))

        const connectEvent: SignInEvent = {
            type: "signin",
            playerName: playerName
        }

        get().websocket?.send(JSON.stringify(connectEvent))
    },
    handleSignInServerEvent: (signInServerEvent) => {
        if (!signInServerEvent.result) {
            set((state) => ({...state, error: "Error occurred. Try again later."}))
        }

        set((state) => ({...state, scene: "lobby"}))
    },
    sendCreateEvent: (gameName: string) => {
        if (!get().isWebSocketReady) {
            set((state) => ({...state, error: "Not connected to server. Try again later."}))
            return
        }

        const createEvent: CreateEvent = {
            type: "create",
            gameName: gameName
        }

        get().websocket?.send(JSON.stringify(createEvent))
    },
    handleCreateServerEvent: (createServerEvent) => {
        if (!createServerEvent.result) {
            set((state) => ({
                ...state,
                error: "Error occurred. Try again later."
            }))
        }

        set((state) => ({
            ...state,
            scene: "room",
            game: {
                id: createServerEvent.gameId,
                name: createServerEvent.gameName,
                host: state.playerName,
                players: [state.playerName],
                isCanStart: false,
                state: "waiting",
                playerTurn: null,
                playerCards: [],
                playersScores: new Map([
                    [state.playerName, { red: 0, blue: 0, orange: 0}]
                ]),
                discardPile: [],
                isAttackTarget: false
            }
        }))
    },
    sendJoinEvent: (gameId: number) => {
        if (!get().isWebSocketReady) {
            set((state) => ({...state, error: "Not connected to server. Try again later."}))
            return
        }

        const joinEvent: JoinEvent = {
            type: "join",
            gameId: gameId
        }

        get().websocket?.send(JSON.stringify(joinEvent))
    },
    handleJoinServerEvent: (joinServerEvent) => {
        if (!joinServerEvent.result && joinServerEvent.playerJoin === get().playerName) {
            set((state) => ({
                ...state,
                error: "Error occurred. Try again later.",
            }))
        }

        const updatedGame: Game = {
            id: joinServerEvent.gameId,
            name: joinServerEvent.gameName,
            host: joinServerEvent.host,
            players: joinServerEvent.players,
            isCanStart: joinServerEvent.isCanStart,
            state: "waiting",
            playerTurn: null,
            playerCards: [],
            playersScores: new Map(
                joinServerEvent.players.map(player => [player, { red: 0, blue: 0, orange: 0}])
            ),
            discardPile: [],
            isAttackTarget: false
        }

        if (joinServerEvent.playerJoin === get().playerName) {
            set((state) => ({
                ...state,
                scene: "room",
                game: updatedGame
            }))
        } else {
            set((state) => ({
                ...state,
                game: updatedGame
            }))
        }
    },
    sendLeaveEvent: () => {
        if (!get().isWebSocketReady) {
            set((state) => ({...state, error: "Not connected to server. Try again later."}))
            return
        }

        const leaveEvent: LeaveEvent = {
            type: "leave"
        }

        get().websocket?.send(JSON.stringify(leaveEvent))
    },
    handleLeaveServerEvent: (leaveServerEvent) => {
        if (!leaveServerEvent.result && leaveServerEvent.playerLeave === get().playerName) {
            set((state) => ({
                ...state,
                error: "Error occurred. Try again later.",
            }))
        }

        if (leaveServerEvent.playerLeave === get().playerName) {
            set((state) => ({
                ...state,
                scene: "lobby",
                game: null,
            }))
        } else {
            const game = get().game
            if (game == null) {
                return
            }

            set((state) => ({
                ...state,
                game: {
                    ...game,
                    id: leaveServerEvent.gameId,
                    name: leaveServerEvent.gameName,
                    host: leaveServerEvent.host,
                    players: leaveServerEvent.players,
                    isCanStart: leaveServerEvent.isCanStart,
                }
            }))
        }
    },
    sendSearchEvent: () => {
        if (!get().isWebSocketReady) {
            set((state) => ({...state, error: "Not connected to server. Try again later."}))
            return
        }

        const searchEvent: SearchEvent = {
            type: "search"
        }

        get().websocket?.send(JSON.stringify(searchEvent))
    },
    handleSearchServerEvent: (searchServerEvent) => {
        if (!searchServerEvent.result) {
            set((state) => ({
                ...state,
                error: "Error occurred. Try again later.",
            }))
        }

        set((state) => ({
            ...state,
            lobby: searchServerEvent.rooms
        }))
    },
    sendStartEvent: () => {
        if (!get().isWebSocketReady) {
            set((state) => ({...state, error: "Not connected to server. Try again later."}))
            return
        }

        const startEvent: StartEvent = {
            type: "start"
        }

        get().websocket?.send(JSON.stringify(startEvent))
    },
    handleStartServerEvent: (startServerEvent) => {
        if (!startServerEvent.result) {
            set((state) => ({
                ...state,
                error: "Error occurred. Try again later.",
            }))
        }

        set((state) => ({
            ...state,
            scene: "game"
        }))
    },
    handleAttackPlayServerEvent: (attackPlayServerEvent: AttackPlayServerEvent) => {
        if (!attackPlayServerEvent.result) {
            set((state) => ({
                ...state,
                error: "An error has occurred.",
            }))
        }

        const game = get().game
        if (game != null) {
            const updatedGame: Game = {
                ...game,
                state: "attack",
                playerTurn: attackPlayServerEvent.playerTarget,
                discardPile: [...game.discardPile, attackPlayServerEvent.card],
                isAttackTarget: attackPlayServerEvent.playerTarget === get().playerName
            }

            const playerAttacker = attackPlayServerEvent.playerAttack == get().playerName ? "You are" : `${attackPlayServerEvent.playerAttack} is`
            const playerTarget = attackPlayServerEvent.playerTarget == get().playerName ? "you" : attackPlayServerEvent.playerTarget

            set((state) => ({
                ...state,
                game: updatedGame,
                actionAnnouncement: `${playerAttacker} attacking ${playerTarget}`
            }))
        }
    },
    sendAttackPlayEvent: (cardId: number) => {
        if (!get().isWebSocketReady) {
            set((state) => ({...state, error: "Not connected to server. Try again later."}))
            return
        }

        const attackPlayEvent: AttackPlayEvent = {
            type: "play",
            action: "attack",
            cardId: cardId
        }

        get().websocket?.send(JSON.stringify(attackPlayEvent))
    },
    handleCounterPlayServerEvent: (counterPlayServerEvent: CounterPlayServerEvent) => {
        if (!counterPlayServerEvent.result) {
            set((state) => ({
                ...state,
                error: "An error has occurred.",
            }))
        }

        const game = get().game
        if (game != null) {
            const updatedGame: Game = {
                ...game,
                discardPile: [...game.discardPile, counterPlayServerEvent.card],
                playersScores: new Map(
                    Object.entries(counterPlayServerEvent.playersScores)
                )
            }

            const playerCounter = counterPlayServerEvent.playerCounter == get().playerName ? "You" : counterPlayServerEvent.playerCounter

            set((state) => ({
                ...state,
                game: updatedGame,
                actionAnnouncement: `${playerCounter} counter-attacked`
            }))
        }
    },
    sendCounterPlayEvent: (cardId: number) => {
        if (!get().isWebSocketReady) {
            set((state) => ({...state, error: "Not connected to server. Try again later."}))
            return
        }

        const counterPlayEvent: CounterPlayEvent = {
            type: "play",
            action: "counter",
            cardId: cardId
        }

        get().websocket?.send(JSON.stringify(counterPlayEvent))
    },
    handleDefendPlayServerEvent: (defendPlayServerEvent: DefendPlayServerEvent) => {
        if (!defendPlayServerEvent.result) {
            set((state) => ({
                ...state,
                error: "An error has occurred.",
            }))
        }

        const game = get().game
        if (game != null) {
            const updatedGame: Game = {
                ...game,
                discardPile: [...game.discardPile, defendPlayServerEvent.card],
                playersScores: new Map(
                    Object.entries(defendPlayServerEvent.playersScores)
                )
            }

            const playerDefend = defendPlayServerEvent.playerDefend == get().playerName ? "You" : defendPlayServerEvent.playerDefend

            set((state) => ({
                ...state,
                game: updatedGame,
                actionAnnouncement: `${playerDefend} built up defence`
            }))
        }
    },
    sendDefendPlayEvent: (cardId: number) => {
        if (!get().isWebSocketReady) {
            set((state) => ({...state, error: "Not connected to server. Try again later."}))
            return
        }

        const defendPlayEvent: DefendPlayEvent = {
            type: "play",
            action: "defend",
            cardId: cardId
        }

        get().websocket?.send(JSON.stringify(defendPlayEvent))
    },
    handleDrawPlayServerEvent: (drawPlayServerEvent: DrawPlayServerEvent) => {
        if (!drawPlayServerEvent.result) {
            set((state) => ({
                ...state,
                error: "An error has occurred.",
            }))
        }

        const game = get().game
        if (game != null) {
            const updatedGame: Game = {
                ...game,
                playerCards: [...game.playerCards, ...drawPlayServerEvent.cards]
            }

            set((state) => ({
                ...state,
                game: updatedGame
            }))
        }
    },
    handleEndPlayServerEvent: (endPlayServerEvent: EndPlayServerEvent) => {
        if (!endPlayServerEvent.result) {
            set((state) => ({
                ...state,
                error: "An error has occurred.",
            }))
        }

        const game = get().game
        if (game != null) {
            const updatedGame: Game = {
                ...game,
                state: "end",
                playerTurn: null
            }

            const playerWin = endPlayServerEvent.playerWin == get().playerName ? "You" : get().playerName

            set((state) => ({
                ...state,
                game: updatedGame,
                actionAnnouncement: `${playerWin} won`
            }))
        }
    },
    handleSkipPlayServerEvent: (skipPlayServerEvent: SkipPlayServerEvent) => {
        if (!skipPlayServerEvent.result) {
            set((state) => ({
                ...state,
                error: "An error has occurred.",
            }))
        }

        const game = get().game
        if (game != null) {
            const updatedGame: Game = {
                ...game,
                playersScores: new Map(
                    Object.entries(skipPlayServerEvent.playersScores)
                )
            }

            const playerSkip = skipPlayServerEvent.playerSkip == get().playerName ? "You" : get().playerName

            set((state) => ({
                ...state,
                game: updatedGame,
                actionAnnouncement: `${playerSkip} skipped`
            }))
        }
    },
    sendSkipPlayEvent: () => {
        if (!get().isWebSocketReady) {
            set((state) => ({...state, error: "Not connected to server. Try again later."}))
            return
        }

        const skipPlayEvent: SkipPlayEvent = {
            type: "play",
            action: "skip"
        }

        get().websocket?.send(JSON.stringify(skipPlayEvent))
    },
    handleTurnPlayServerEvent: (turnPlayServerEvent: TurnPlayServerEvent) => {
        if (!turnPlayServerEvent.result) {
            set((state) => ({
                ...state,
                error: "An error has occurred.",
            }))
        }

        const game = get().game
        if (game != null) {
            const updatedGame: Game = {
                ...game,
                state: "turn",
                playerTurn: turnPlayServerEvent.playerTurn
            }

            set((state) => ({
                ...state,
                game: updatedGame
            }))
        }
    }
})

export default createEventSlice
