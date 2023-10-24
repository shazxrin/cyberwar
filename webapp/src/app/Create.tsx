import useAppStore from "../store/appStore"

export default function Create() {
    const {sendCreateEvent, setScene} = useAppStore((state) => ({
        sendCreateEvent: state.sendCreateEvent,
        setScene: state.setScene
    }))

    return (
        <div className={"h-screen w-screen bg-gray-300"}>
            <div className="flex flex-col items-center justify-center h-screen space-y-3">
                <h1 className="bold text-7xl mb-6">create game</h1>
                <form
                    className="flex flex-col items-center"
                    onSubmit={(e) => {
                        e.preventDefault();

                        const form = e.currentTarget;
                        const formData = new FormData(form);
                        const roomname = formData.get("roomname") as string

                        sendCreateEvent(roomname)
                    }}
                >
                    <label htmlFor="roomname">enter game name</label>
                    <input type={"text"}
                           name={"roomname"}
                           required={true}
                           pattern={"[A-Za-z0-9 ]{1,20}"}
                           className="border p-2"
                    />
                    <div className="flex flex-row items-center justify-center space-x-3 mt-6">
                        <button className="border-2 border-gray-500 bg-gray-500 p-2 rounded-md" type="submit">create</button>
                        <button className="border-2 border-gray-500 p-2 rounded-md" onClick={() => setScene("lobby")}>cancel</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
