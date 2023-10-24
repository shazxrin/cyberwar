import {create} from "zustand"
import createWebSocketSlice from "./websocketSlice.ts"
import createSceneSlice from "./sceneSlice.ts"
import createGameSlice from "./gameSlice.ts"
import createLobbySlice from "./lobbySlice.ts"
import createEventSlice from "./eventSlice.ts"
import {AppStore} from "./store"
import {devtools} from "zustand/middleware"

const useAppStore = create<AppStore>()(
    devtools((...args) => ({
            ...createWebSocketSlice(...args),
            ...createSceneSlice(...args),
            ...createGameSlice(...args),
            ...createLobbySlice(...args),
            ...createEventSlice(...args)
        })
    )
)

export default useAppStore
