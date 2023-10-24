import {StateCreator} from "zustand"
import {AppStore, LobbySlice} from "./store"

const createLobbySlice: StateCreator<AppStore, [], [], LobbySlice> = () => ({
    lobby: []
})

export default createLobbySlice
