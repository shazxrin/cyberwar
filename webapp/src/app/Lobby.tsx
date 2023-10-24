import {useEffect} from "react"
import useAppStore from "../store/appStore"

export default function Lobby() {
    const {setScene, lobby, sendSearchEvent, sendJoinEvent} = useAppStore((state) => ({
        setScene: state.setScene,
        lobby: state.lobby,
        sendSearchEvent: state.sendSearchEvent,
        sendJoinEvent: state.sendJoinEvent
    }))

    useEffect(() => {
        sendSearchEvent()
    }, [])

    return (
        <div className={"h-screen w-screen bg-gray-300"}>
            <div className="flex flex-col items-center justify-center h-screen space-y-3">
                <h1 className="bold text-7xl mb-6">lobby</h1>
                {lobby.map(game => (
                    <div key={game.gameId} className="bg-gray-400">
                        <div className="flex flex-col space-y-4 w-[400px] p-4">
                            <h2 className="font-bold text-2xl">{game.gameName}</h2>
                            <button 
                                className={`border-2 border-gray-500 ${game.isFull ? "bg-red-200" : "bg-gray-500"} p-2 rounded-md`}
                                onClick={() => sendJoinEvent(game.gameId)}
                                disabled={game.isFull}
                            >
                                    join
                            </button>
                        </div>
                    </div>
                ))}
                <div className="flex flex-row items-center justify-center space-x-3 mt-6">
                    <button className="border-2 border-gray-500 bg-gray-500 p-2 rounded-md" onClick={() => sendSearchEvent()}>refresh</button>
                    <button className="border-2 border-gray-500 p-2 rounded-md" onClick={() => setScene("create")}>create</button>
                </div>
            </div>
        </div>
    )
}
