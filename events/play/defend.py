import logging
import random
from typing import Dict, Optional

from card import CardCategory, CardType, Card, CardManager
from events.play.draw import DrawActionPlayServerEvent
from events.play.end import EndActionPlayServerEvent
from events.play.turn import TurnActionPlayServerEvent
from game import Game, GameState
from player import Player


class DefendActionPlayServerEvent:
    def __init__(self,
                 result: bool,
                 player_defend: Optional[str] = None,
                 card: Optional[Card] = None,
                 players_scores: Optional[Dict[str, Dict[CardCategory, int]]] = None):
        self.result = result
        self.player_defend = player_defend
        self.card = card
        self.players_scores = players_scores

    def to_dict(self) -> Dict:
        return {
            "type": "play",
            "action": "defend",
            "result": self.result,
            "playerDefend": self.player_defend,
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


async def defend_action_handler(event: dict, player: Player, game: Game, card_mgr: CardManager) -> None:
    if game.players[game.player_turn_no] != player:
        logging.info(f"{player}: ('play') ~defend~ Not player's turn. Skipping.")
        await player.send_event(DefendActionPlayServerEvent(False).to_dict())
        return

    if game.game_state != GameState.TURN:
        logging.info(f"{player}: ('play') ~defend~ Game state is not in turn mode. Skipping.")
        await player.send_event(DefendActionPlayServerEvent(False).to_dict())
        return

    if "cardId" not in event:
        logging.info(f"{player}: ('play') ~defend~ Missing values. Skipping.")
        await player.send_event(DefendActionPlayServerEvent(False).to_dict())
        return
    card_id = event["cardId"]

    logging.info(f"{player}: ('play') ~defend~ Defending.")
    if card_id in game.players_hand[player]:
        defend_card = card_mgr.cards[card_id]

        if defend_card.card_type != CardType.DEFEND:
            logging.info(f"{player}: ('play') ~defend~ Card played not defend card. Skipping.")
            return
        if defend_card.card_category == CardCategory.WILD:
            logging.info(f"{player}: ('play') ~defend~ Card type is wild. Skipping.")
            return

        # update game state
        game.discarded = defend_card
        game.players_hand[player].remove(card_id)
        game.player_turn_no = (game.player_turn_no + 1) % game.PLAYER_LIMIT
        game.players_scores[player][defend_card.card_category] += 1
        player_winner = game.get_winner()
        game.game_state = GameState.TURN if player_winner is None else GameState.END

        # defender draw card
        if player_winner is None:
            draw_card_id = random.choice(card_mgr.deck_card_ids)
            draw_card = card_mgr.cards[draw_card_id]
            game.players_hand[player].append(draw_card_id)
            await player.send_event(DrawActionPlayServerEvent(True, [draw_card]).to_dict())
            logging.info(f"{player}: ('play') ~defend~ Draw {draw_card}.")

        # update player clients
        for game_player in game.players:
            await game_player.send_event(
                DefendActionPlayServerEvent(
                    True,
                    player.name,
                    defend_card, {game_player.name: scores for game_player, scores in game.players_scores.items()}
                ).to_dict()
            )

            if player_winner is None:
                await game_player.send_event(TurnActionPlayServerEvent(True, game.players[game.player_turn_no].name).to_dict())
            else:
                await game_player.send_event(EndActionPlayServerEvent(True, player_winner.name).to_dict())

    else:
        logging.info(f"{player}: ('play') ~defend~ Card not in player hand. Skipping.")
        await player.send_event(DefendActionPlayServerEvent(False).to_dict())
