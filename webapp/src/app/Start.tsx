import useAppStore from "../store/appStore"

export default function Start() {
    const {sendSignInEvent} = useAppStore((state) => ({
        sendSignInEvent: state.sendSignInEvent
    }))

    return (
        <div className={"h-screen w-screen bg-gray-300"}>
            <div className="flex flex-col items-center justify-center h-screen space-y-3">
                <h1 className="bold text-7xl mb-6">cyberwarrior</h1>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();

                        const form = e.currentTarget;
                        const formData = new FormData(form);
                        const username = formData.get("username") as string

                        sendSignInEvent(username)
                    }}
                    className="flex flex-col items-center"
                >
                    <label htmlFor={"username"}>enter username</label>
                    <input type={"text"}
                           name={"username"}
                           required={true}
                           pattern={"[A-Za-z0-9]{1,20}"}
                           className="border p-2"
                    />
                    <button className={"bg-gray-500 p-2 rounded-md mt-2"} type={"submit"}>hack in</button>
                </form>
            </div>
        </div>
    )
}
