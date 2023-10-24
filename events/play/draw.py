from typing import Dict, List

from card import Card


class DrawActionPlayServerEvent:
    def __init__(self, result: bool, cards: List[Card]):
        self.result = result
        self.cards = cards

    def to_dict(self) -> Dict:
        return {
            "type": "play",
            "action": "draw",
            "result": self.result,
            "cards": [{
                "id": card.id,
                "title": card.title,
                "image": card.image,
                "description": card.description,
                "cardType": card.card_type.value,
                "cardCategory": card.card_category.value,
                "cardSubCategories": [card_sub_category.value for card_sub_category in card.card_sub_categories]
            } for card in self.cards]
        }
