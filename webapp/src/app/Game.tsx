import {
    IconChevronsRight,
    IconCircle,
    IconPlayerPlayFilled,
    IconShield,
    IconSquare,
    IconSwords,
    IconTriangle,
    IconUser
} from "@tabler/icons-react"
import {Card, CardCategory, CardSubCategory} from "../game/card.ts"
import useAppStore from "../store/appStore.ts"
import {AnimatePresence, motion} from "framer-motion"
import {useState} from "react"

const getCardColors = (cardCategory: CardCategory): [string, string] => {
    if (cardCategory == "red") {
        return ["bg-rose-600", "border-rose-700"]
    } else if (cardCategory == "orange") {
        return ["bg-orange-600", "border-orange-700"]
    } else if (cardCategory == "blue") {
        return ["bg-blue-600", "border-blue-700"]
    } else {
        return ["bg-gray-600", "border-gray-700"]
    }
}

const getCardSubCategoryPattern = (card: Card): Map<CardSubCategory, boolean> =>  {
    const cardSubCategoriesPattern = new Map<CardSubCategory, boolean>([
        ["square", false],
        ["circle", false],
        ["triangle", false],
    ])
    card.cardSubCategories.forEach(subCat => cardSubCategoriesPattern.set(subCat, true))

    return cardSubCategoriesPattern
}

const isCardSubCategoryCompatible = (card1: Card, card2: Card): boolean => {
    const card1SubCategoriesPattern = getCardSubCategoryPattern(card1)
    const card2SubCategoriesPattern = getCardSubCategoryPattern(card2)

    const allCardSubCategories: CardSubCategory[] = ["square", "circle", "triangle"]
    return allCardSubCategories.some(subCat => card1SubCategoriesPattern.get(subCat) && card2SubCategoriesPattern.get(subCat))
}

type SkipGameCardProps = {
    isInteractive: boolean
}

function SkipGameCard({isInteractive}: SkipGameCardProps) {
    const {sendSkipPlayEvent} = useAppStore((state) => ({
        sendSkipPlayEvent: state.sendSkipPlayEvent
    }))

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{
                opacity: isInteractive ? 1 : 0.8,
                scale: 1,
                translateY: isInteractive ? 1 : 100
            }}
            exit={{ opacity: 0 }}
            whileHover={{
                translateY: isInteractive ? -20 : 100
            }}
            onClick={async () => {
                if (!isInteractive) {
                    return
                }

                sendSkipPlayEvent()
            }}
            className={`
                min-w-[225px] min-h-[300px] max-w-[225px] max-h-[300px] p-4 rounded-xl drop-shadow-md
                bg-purple-600 border-purple-700 border-b-4
                ${isInteractive ? "cursor-pointer" : "cursor-not-allowed"}
            `}
        >
            <IconChevronsRight />
            <h1 className={`font-bold text-md}`}>Skip</h1>
            <p className={`text-sm`}>Skip your turn</p>
        </motion.div>
    )
}

type GameCardProps = {
    card: Card
}

function GameCard({card}: GameCardProps) {
    const [isImgLoaded, setImgLoaded] = useState(false)

    const [bgColor, borderColor] = getCardColors(card.cardCategory)

    return (
        <div
            className={`
                min-w-[225px] min-h-[300px] max-w-[225px] max-h-[300px] p-4 rounded-xl drop-shadow-md
                ${bgColor} ${borderColor} border-b-4
            `}
        >
            <div className={"flex flex-row justify-between"}>
                <div>
                    {card.cardType == "attack" && <IconSwords stroke={2.5} />}
                    {card.cardType == "defend" && <IconShield stroke={2.5} />}
                </div>
                <div className={"flex flex-row space-x-1"}>
                    {card.cardSubCategories.map(subCategory => {
                        if (subCategory == "circle") {
                            return <IconCircle key={"circle"} stroke={2.5} />
                        } else if (subCategory == "triangle") {
                            return <IconTriangle key={"triangle"} stroke={2.5} />
                        } else if (subCategory == "square") {
                            return <IconSquare key={"square"} stroke={2.5} />
                        }
                    })}
                </div>
            </div>
            <div className={"w-full h-[100px] relative mt-2"}>
                <img src={card.image}
                     onLoad={() => setImgLoaded(true)}
                     className={`absolute w-full h-[100px] object-fill rounded-lg ${isImgLoaded ? "visible" : "hidden"}`}
                />
                <AnimatePresence>
                    {
                        !isImgLoaded &&
                        <motion.div
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={"absolute w-full h-[100px] bg-white rounded-lg"}
                        />
                    }
                </AnimatePresence>
            </div>
            <h1 className={`font-bold text-sm mt-2 mb-1`}>{card.title}</h1>
            <p className={`text-xs`}>{card.description}</p>
        </div>
    )
}

type PlayerGameCardProps = {
    card: Card,
    isInteractive: boolean
}

function PlayerGameCard({card, isInteractive}: PlayerGameCardProps) {
    const {game, discardPlayerCard, sendAttackPlayEvent, sendDefendPlayEvent, sendCounterPlayEvent} = useAppStore((state) => ({
        game: state.game,
        discardPlayerCard: state.discardPlayerCard,
        sendAttackPlayEvent: state.sendAttackPlayEvent,
        sendDefendPlayEvent: state.sendDefendPlayEvent,
        sendCounterPlayEvent: state.sendCounterPlayEvent
    }))

    if (game == null) {
        return <></>
    }

    let canPlay = false
    const isAttacked = game.state == "attack" && game.isAttackTarget
    if (isAttacked) {
        const attackCard = game.discardPile[game.discardPile.length - 1]

        if (card.cardCategory === "wild") {
            canPlay = true
        } else {
            canPlay = card.cardType === "defend" &&
                card.cardCategory === attackCard.cardCategory &&
                isCardSubCategoryCompatible(card, attackCard)
        }
    } else {
        canPlay = isInteractive && (card.cardCategory != "wild")
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{
                opacity: canPlay ? 1 : 0.8,
                scale: 1,
                translateY: canPlay ? 1 : 100
            }}
            exit={{ opacity: 0 }}
            whileHover={{
                translateY: canPlay ? -20 : 100
            }}
            onClick={async () => {
                if (!isInteractive) {
                    return
                }

                if (!canPlay) {
                    return
                }

                await new Promise(r => setTimeout(r, 500))

                if (isAttacked) {
                    if (card.cardType == "defend") {
                        sendCounterPlayEvent(card.id)
                    }
                } else {
                    if (card.cardType == "attack") {
                        sendAttackPlayEvent(card.id)
                    } else if (card.cardType == "defend") {
                        sendDefendPlayEvent(card.id)
                    }
                }
                discardPlayerCard(card.id)
            }}
            className={`${canPlay ? "cursor-pointer" : "cursor-not-allowed"}`}
        >
            <GameCard card={card} />
        </motion.div>
    )
}

type DiscardGameCardProps = {
    card: Card,
}

function DiscardGameCard({card}: DiscardGameCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, rotateZ: 0, scale: 1.5}}
            animate={{ opacity: 1, rotateZ: (card.id / 64 * 45) + -25, scale: 1 }}
            exit={{ opacity: 0 }}
        >
            <GameCard card={card} />
        </motion.div>
    )
}

type PlayerScoreProps = {
    name: string
}

function PlayerScore({name}: PlayerScoreProps) {
    const {game} = useAppStore((state) => ({
        game: state.game
    }))

    return (
        <div className={"flex flex-row items-center space-x-2"}>
            <div className={"h-[25px] w-[25px] animate-pulse"}>
                {game?.playerTurn === name && <IconPlayerPlayFilled />}
            </div>
            <div className={"h-[25px] w-[25px]"}>
                <IconUser />
            </div>
            <h1 className={"cursor-default w-[8ch] overflow-x-hidden overflow-ellipsis"}>{name}</h1>

            <div className={"h-[15px] w-[15px] rounded-full bg-rose-600"} />
            <p>{game?.playersScores.get(name)?.red}</p>

            <div className={"h-[15px] w-[15px] rounded-full bg-orange-600"} />
            <p>{game?.playersScores.get(name)?.orange}</p>

            <div className={"h-[15px] w-[15px] rounded-full bg-blue-600"} />
            <p>{game?.playersScores.get(name)?.blue}</p>
        </div>
    )
}

function ScoreBoard() {
    const {game} = useAppStore((state) => ({
        game: state.game
    }))

    return (
        <div className={"flex flex-col w-[100%] h-[100%] absolute justify-start pt-4 pl-4"}>
            <h1 className={"font-bold text-xl"}>Scoreboard</h1>
            <div className={"flex flex-col justify-start space-y-2 mt-2"}>
                {
                    game?.players.map(player => (
                        <PlayerScore key={player} name={player} />
                    ))
                }
            </div>
        </div>
    )
}

function ActionAnnouncement() {
    const {actionAnnouncement} = useAppStore((state) => ({
        actionAnnouncement: state.actionAnnouncement
    }))

    return (
        <h2 className={"text-lg"}>
            {actionAnnouncement}
        </h2>
    )
}

function TurnAnnouncement() {
    const {game, playerName} = useAppStore((state) => ({
        game: state.game,
        playerName: state.playerName
    }))

    return (
        <h2 className={"font-bold text-4xl"}>
            {game?.state === "end" ? "Game finished!" : (game?.playerTurn === playerName ? "Your turn" : `${game?.playerTurn} turn`)}
        </h2>
    )
}

function Announcements() {
    return (
        <div className={"flex flex-col w-[100%] h-[100%] absolute justify-start"}>
            <div className={"flex flex-col items-center justify-center mt-6"}>
                <TurnAnnouncement />
                <ActionAnnouncement />
            </div>
        </div>

    )
}

function PlayerHand() {
    const {game, playerName} = useAppStore((state) => ({
        game: state.game,
        playerName: state.playerName
    }))

    return (
        <div className={"flex flex-col w-[100%] h-[100%] absolute justify-end"}>
            <div className={"flex flex-row w-[100%] h-[50%] items-end px-8 space-x-4 overflow-y-hidden overflow-x-scroll"}>
                <AnimatePresence>
                    {
                        game?.playerCards.map((card) => (
                            <PlayerGameCard
                                key={`${card.id}`}
                                card={card}
                                isInteractive={game?.playerTurn === playerName}
                            />
                        ))
                    }
                    <SkipGameCard isInteractive={game?.playerTurn === playerName} />
                </AnimatePresence>
            </div>
        </div>
    )
}

function DiscardPile() {
    const {game} = useAppStore((state) => ({
        game: state.game
    }))

    return (
        <div className={"flex flex-col w-[100%] h-[100%] absolute justify-center items-center"}>
            <div className={"flex flex-col w-[100%] h-[100%] relative justify-center items-center bottom-32"}>
                {
                    game?.discardPile.map((card) => (
                        <div
                            className={"absolute"}
                        >
                            <DiscardGameCard card={card}/>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default function Game() {
    return (
        <div className={"w-[100vw] h-[100vh] bg-gray-300"}>
            <ScoreBoard />
            <Announcements />
            <DiscardPile />
            <PlayerHand />
        </div>
    )
}