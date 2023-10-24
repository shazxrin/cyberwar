import logging
import random
from typing import Dict, Optional

from card import CardCategory, CardType, Card, CardManager
from events.play.draw import DrawActionPlayServerEvent
from events.play.turn import TurnActionPlayServerEvent
from game import Game, GameState
from player import Player


class CounterActionPlayEventResult:
    def __init__(self,
                 result: bool,
                 player_counter: Optional[str] = None,
                 card: Optional[Card] = None,
                 players_scores: Optional[Dict[str, Dict[CardCategory, int]]] = None):
        self.result = result
        self.player_counter = player_counter
        self.card = card
        self.players_scores = players_scores

    def to_dict(self) -> Dict:
        return {
            "type": "play",
            "action": "counter",
            "result": self.result,
            "playerCounter": self.player_counter,
            "card": {
                "id": self.card.id,
                "title": self.card.title,
                "image": self.card.image,
                "description": self.card.description,
                "cardType": self.card.card_type.value,
                "cardCategory": self.card.card_category.value,
                "cardSubCategories": [card_sub_category.value for card_sub_category in self.card.card_sub_categories]
            },
            "playersScores": {player: {
                "red": scores[CardCategory.RED],
                "blue": scores[CardCategory.BLUE],
                "orange": scores[CardCategory.ORANGE]
            } for player, scores in self.players_scores.items()}
        }


async def counter_action_handler(event: dict, player: Player, game: Game, card_mgr: CardManager) -> None:
    if game.game_state != GameState.COUNTER:
        logging.info(f"{player}: ('play') ~counter~ Game state is not in counter mode. Skipping.")
        await player.send_event(CounterActionPlayEventResult(False).to_dict())
        return

    if game.players[(game.player_turn_no + 1) % game.PLAYER_LIMIT] != player:
        logging.info(f"{player}: ('play') ~counter~ Player not target of the attack. Skipping.")
        await player.send_event(CounterActionPlayEventResult(False).to_dict())
        return

    if "cardId" not in event:
        logging.info(f"{player}: ('play') ~counter~ Missing values. Skipping.")
        await player.send_event(CounterActionPlayEventResult(False).to_dict())
        return
    card_id = event["cardId"]

    logging.info(f"{player}: ('play') ~counter~ Countering.")
    if card_id in game.players_hand[player]:
        # check defend card's eligibility
        defend_card = card_mgr.cards[card_id]

        if defend_card.card_type != CardType.DEFEND:
            logging.info(f"{player}: ('play') ~counter~ Card played not defend card. Skipping.")
            await player.send_event(CounterActionPlayEventResult(False).to_dict())
            return

        if defend_card.card_category is not CardCategory.WILD and defend_card.card_category is not game.discarded.card_category:
            logging.info(f"{player}: ('play') ~counter~ Defend card does not match attack card's category. Skipping.")
            await player.send_event(CounterActionPlayEventResult(False).to_dict())
            return

        sub_categories_match = False
        for sub_category in defend_card.card_sub_categories:
            sub_categories_match = sub_category in game.discarded.card_sub_categories
            if sub_categories_match:
                break
        if not sub_categories_match:
            logging.info(f"{player}: ('play') ~counter~ Defend card does not match attack card's sub categories. Skipping.")
            await player.send_event(CounterActionPlayEventResult(False).to_dict())
            return

        # attacker draw card
        player_attack = game.players[game.player_turn_no]

        draw_card_id = random.choice(card_mgr.deck_card_ids)
        draw_card = card_mgr.cards[draw_card_id]
        game.players_hand[player_attack].append(draw_card_id)
        await player_attack.send_event(DrawActionPlayServerEvent(True, [draw_card]).to_dict())
        logging.info(f"{player_attack}: ('play') ~counter~ Draw {draw_card}.")

        # update game state
        game.game_state = GameState.TURN
        game.discarded = defend_card
        game.players_hand[player].remove(card_id)
        game.player_turn_no = (game.player_turn_no + 1) % game.PLAYER_LIMIT

        # update player clients
        for game_player in game.players:
            await game_player.send_event(
                CounterActionPlayEventResult(
                    True,
                    player.name,
                    defend_card,
                    {game_player.name: scores for game_player, scores in game.players_scores.items()}
                ).to_dict())
            await game_player.send_event(TurnActionPlayServerEvent(True, game.players[game.player_turn_no].name).to_dict())

    else:
        logging.info(f"{player}: ('play') ~counter~ Card not in player hand. Skipping.")
        await player.send_event(CounterActionPlayEventResult(False).to_dict())
