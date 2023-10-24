export type CardType = "attack" | "defend" | "trivia"

export type CardCategory  = "red" | "orange" | "blue" | "wild"

export type CardSubCategory = "square" | "triangle" | "circle"

export type Card = {
    id: number,
    title: string,
    image: string,
    description: string,
    cardType: CardType,
    cardCategory: CardCategory,
    cardSubCategories: CardSubCategory[]
}
