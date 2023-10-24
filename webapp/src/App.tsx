import "./App.css"
import "./index.css"
import Game from "./app/Game.tsx"
import {useEffect} from "react"
import useAppStore from "./store/appStore.ts"
import Start from "./app/Start.tsx"
import Lobby from "./app/Lobby.tsx"
import Create from "./app/Create.tsx"
import Room from "./app/Room.tsx"

export default function App() {
    const { initWebSocket, closeWebSocket, scene } = useAppStore((state) => ({
        initWebSocket: state.initWebSocket,
        closeWebSocket: state.closeWebSocket,
        scene: state.scene
    }))

    useEffect(() => {
        initWebSocket()

        return () => {
            closeWebSocket()
        }
    }, [])

    return (
        <>
            {scene === "start" && <Start /> }
            {scene === "lobby" && <Lobby /> }
            {scene === "create" && <Create /> }
            {scene === "room" && <Room /> }
            {scene === "game" && <Game/> }
        </>
    )
}
