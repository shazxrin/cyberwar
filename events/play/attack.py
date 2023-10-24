import logging
from typing import Dict, Optional

from card import Card, CardType, CardManager
from game import GameState, Game
from player import Player


class AttackActionPlayServerEvent:
    def __init__(self,
                 result: bool,
                 player_attack: Optional[str] = None,
                 player_target: Optional[str] = None,
                 card: Optional[Card] = None):
        self.result = result
        self.player_attack = player_attack
        self.player_target = player_target
        self.card = card

    def to_dict(self) -> Dict:
        return {
            "type": "play",
            "action": "attack",
            "result": self.result,
            "playerAttack": self.player_attack,
            "playerTarget": self.player_target,
            "card": {
                "id": self.card.id,
                "title": self.card.title,
                "image": self.card.image,
                "description": self.card.description,
                "cardType": self.card.card_type.value,
                "cardCategory": self.card.card_category.value,
                "cardSubCategories": [card_sub_category.value for card_sub_category in self.card.card_sub_categories]
            }
        }


async def attack_action_handler(event: dict, player: Player, game: Game, card_mgr: CardManager) -> None:
    if game.players[game.player_turn_no] != player:
        logging.info(f"{player}: ('play') ~attack~ Not player's turn. Skipping.")
        await player.send_event(AttackActionPlayServerEvent(False).to_dict())
        return

    if game.game_state != GameState.TURN:
        logging.info(f"{player}: ('play') ~attack~ Game state is not in turn mode. Skipping.")
        await player.send_event(AttackActionPlayServerEvent(False).to_dict())
        return

    if "cardId" not in event:
        logging.info(f"{player}: ('play') ~attack~ Missing values. Skipping.")
        await player.send_event(AttackActionPlayServerEvent(False).to_dict())
        return
    card_id = event["cardId"]

    logging.info(f"{player}: ('play') ~attack~ Attacking.")
    if card_id in game.players_hand[player]:
        attack_card = card_mgr.cards[card_id]

        # check attack card eligibility
        if attack_card.card_type != CardType.ATTACK:
            logging.info(f"{player}: ('play') ~attack~ Card played not attack card. Skipping.")
            return

        # update game state
        game.game_state = GameState.COUNTER
        game.discarded = attack_card
        game.players_hand[player].remove(card_id)

        # update player client's
        player_target = game.players[(game.player_turn_no + 1) % game.PLAYER_LIMIT]
        for game_player in game.players:
            await game_player.send_event(AttackActionPlayServerEvent(True, player.name, player_target.name, attack_card).to_dict())
    else:
        logging.info(f"{player}: ('play') ~attack~ Card not in player hand. Skipping.")
        await player.send_event(AttackActionPlayServerEvent(False).to_dict())
