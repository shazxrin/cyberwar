import {StateCreator} from "zustand"
import {AppStore, GameSlice} from "./store"
import Game from "../game/game.ts"

const createGameSlice: StateCreator<AppStore, [], [], GameSlice> = (set, get) => ({
    playerName: "player",
    actionAnnouncement: "",
    game: null,
    discardPlayerCard: (cardId) => {
        const game = get().game
        if (game != null) {
            const updatedGame: Game = {
                ...game,
                playerCards: game.playerCards.filter(card => card.id != cardId)
            }

            set((state) => ({
                ...state,
                game: updatedGame
            }))
        }
    }
})

export default createGameSlice
