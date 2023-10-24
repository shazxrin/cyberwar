import {StateCreator} from "zustand"
import Scene from "../game/scene.ts"
import {AppStore, SceneSlice} from "./store"

const createSceneSlice: StateCreator<AppStore, [], [], SceneSlice> = (set) => ({
    scene: "start",
    setScene: (scene: Scene) => {
        set((state) => ({...state, scene: scene}))
    }
})

export default createSceneSlice
