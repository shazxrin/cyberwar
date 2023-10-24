import {StateCreator} from "zustand"
import {ServerEvent} from "../game/events.ts"
import {AppStore, WebSocketSlice} from "./store"

const createWebSocketSlice: StateCreator<AppStore, [], [], WebSocketSlice> = (set, get) => ({
    websocket: null,
    isWebSocketReady: false,
    initWebSocket: () => {
        const newWS = new WebSocket("ws://localhost:8080/ws")

        newWS.addEventListener("open", (_) => {
            set((state) => ({...state, isWebSocketReady: true}))
        })

        newWS.addEventListener("message", (msgEvent) => {
            const serverEvent: ServerEvent = JSON.parse(msgEvent.data)
            get().handleServerEvent(serverEvent)
        })

        set((state) => ({...state, websocket: newWS}))
    },
    closeWebSocket: () => {
        get().websocket?.close()

        set((state) => ({...state, websocket: null, isWebSocketReady: false}))
    }
})

export default createWebSocketSlice
