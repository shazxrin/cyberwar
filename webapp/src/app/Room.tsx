import useAppStore from "../store/appStore"

export default function Room() {
    const {game, playerName, sendLeaveEvent, sendStartEvent} = useAppStore((state) => ({
        game: state.game,
        playerName: state.playerName,
        sendLeaveEvent: state.sendLeaveEvent,
        sendStartEvent: state.sendStartEvent
    }))

    return (
        <div className={"h-screen w-screen bg-gray-300"}>
            <div className="flex flex-col items-center justify-center h-screen space-y-3">
                <h1 className="bold text-7xl mb-6">room</h1>
                <h2 className="text-4xl mb-3">{game?.name}</h2>
                <div className="flex flex-row space-x-2">
                    {game?.players.map((player, index) => (
                        <h3 key={player}>Player {index + 1}: {player}</h3>
                    ))}
                </div>
                <div className="flex flex-row items-center justify-center space-x-3 mt-6">
                    {game?.host == playerName &&
                        <button 
                            className={`border-2 border-gray-500 ${game?.isCanStart ? "bg-gray-500" : "bg-red-200"} p-2 rounded-md`}
                            disabled={!game?.isCanStart}
                            onClick={() => sendStartEvent()}
                        >
                            start
                        </button>
                    }
                    <button className="border-2 border-gray-500 p-2 rounded-md" onClick={() => sendLeaveEvent()}>leave</button>
                </div>
            </div>
        </div>
    )
}