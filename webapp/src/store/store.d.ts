import Scene from "../game/scene.ts"
import Room from "../game/room.ts"
import {
    AttackPlayServerEvent,
    CounterPlayServerEvent,
    CreateServerEvent,
    DefendPlayServerEvent,
    DrawPlayServerEvent,
    EndPlayServerEvent,
    JoinServerEvent,
    LeaveServerEvent,
    SearchServerEvent,
    ServerEvent,
    SignInServerEvent, SkipPlayServerEvent,
    StartServerEvent, TurnPlayServerEvent
} from "../game/events.ts"
import Game from "../game/game.ts"
import {Card} from "../game/card.ts"

export type WebSocketSlice = {
    websocket: WebSocket | null,
    isWebSocketReady: boolean,
    initWebSocket: () => void,
    closeWebSocket: () => void
}

export type SceneSlice = {
    scene: Scene,
    setScene: (scene: Scene) => void
}

export type GameSlice = {
    playerName: string,
    actionAnnouncement: string,
    game: Game | null,
    discardPlayerCard: (cardId: number) => void,
}

export type LobbySlice = {
    lobby: Room[]
}

export type EventSlice = {
    error: string | null,

    handleServerEvent: (serverEvent: ServerEvent) => void,
    sendSignInEvent: (playerName: string) => void,

    handleSignInServerEvent: (signInServerEvent: SignInServerEvent) => void,
    sendCreateEvent: (gameName: string) => void,

    handleCreateServerEvent: (createServerEvent: CreateServerEvent) => void,
    sendJoinEvent: (gameId: number) => void,

    handleJoinServerEvent: (joinServerEvent: JoinServerEvent) => void,
    sendLeaveEvent: () => void,

    handleLeaveServerEvent: (leaveServerEvent: LeaveServerEvent) => void,
    sendSearchEvent: () => void,

    handleSearchServerEvent: (searchServerEvent: SearchServerEvent) => void,
    sendStartEvent: () => void,

    handleStartServerEvent: (startServerEvent: StartServerEvent) => void,

    handleAttackPlayServerEvent: (attackPlayServerEvent: AttackPlayServerEvent) => void,
    sendAttackPlayEvent: (cardId: number) => void,

    handleCounterPlayServerEvent: (counterPlayServerEvent: CounterPlayServerEvent) => void,
    sendCounterPlayEvent: (cardId: number) => void,

    handleDefendPlayServerEvent: (defendPlayServerEvent: DefendPlayServerEvent) => void,
    sendDefendPlayEvent: (cardId: number) => void,

    handleDrawPlayServerEvent: (drawPlayServerEvent: DrawPlayServerEvent) => void,

    handleEndPlayServerEvent: (endPlayServerEvent: EndPlayServerEvent) => void,

    handleSkipPlayServerEvent: (skipPlayServerEvent: SkipPlayServerEvent) => void,
    sendSkipPlayEvent: () => void,

    handleTurnPlayServerEvent: (turnPlayServerEvent: TurnPlayServerEvent) => void
}

export type AppStore = WebSocketSlice & SceneSlice & GameSlice & LobbySlice & EventSlice
