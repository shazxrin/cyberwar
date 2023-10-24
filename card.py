import json
import os
from enum import StrEnum
from typing import List, Dict, Tuple

import gspread


class CardType(StrEnum):
    ATTACK = "attack"
    DEFEND = "defend"
    TRIVIA = "trivia"


class CardCategory(StrEnum):
    RED = "red"
    ORANGE = "orange"
    BLUE = "blue"
    WILD = "wild"


class CardSubCategory(StrEnum):
    SQUARE = "square"
    TRIANGLE = "triangle"
    CIRCLE = "circle"


class Card:
    def __init__(self, id: int, title: str, image: str, description: str, card_type: CardType, card_category: CardCategory, card_sub_categories: List[CardSubCategory]) -> None:
        self.id = id
        self.title = title
        self.image = image
        self.description = description
        self.card_type = card_type
        self.card_category = card_category
        self.card_sub_categories = card_sub_categories

    def __str__(self) -> str:
        sub_categories_str = ", ".join([str(sc.value) for sc in self.card_sub_categories])
        return f"+{self.title} : {self.card_type.value} : {self.card_category.value} : [{sub_categories_str}]+"


class CardManager:
    def __init__(self):
        self.deck: List[Card] = []
        self.deck_card_ids: List[int] = []
        self.cards: Dict[int, Card] = {}

    def fetch_from_database(self):
        gs_cred = os.getenv("GS_CRED")
        sheet_id = os.getenv("GS_SHEET_ID")
        gs_client = gspread.service_account_from_dict(json.loads(gs_cred))
        sheet = gs_client.open_by_key(sheet_id)
        worksheet = sheet.get_worksheet(0)
        database = worksheet.get_all_values()
        for row_no in range(1, len(database)):
            row: Tuple[str, str, str, str, str, str, str] = database[row_no]
            row_val_id, row_val_type, row_val_category, row_val_sub_categories, row_val_title, row_val_description, row_val_image = row

            card = Card(
                int(row_val_id),
                row_val_title,
                row_val_image,
                row_val_description,
                CardType[row_val_type.upper()],
                CardCategory[row_val_category.upper()],
                [CardSubCategory[row_val_sub_category.upper()] for row_val_sub_category in row_val_sub_categories.split(",")]
            )

            self.deck.append(card)
            self.deck_card_ids.append(card.id)
            self.cards[card.id] = card
