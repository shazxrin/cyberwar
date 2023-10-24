import logging
import random
from typing import Dict

from card import CardManager
from events.play.draw import DrawActionPlayServerEvent
from events.play.turn import TurnActionPlayServerEvent
from game import GameState, GameManager
from player import Player


class StartServerEvent:
    def __init__(self, result: bool):
        self.result = result

    def to_dict(self) -> Dict:
        return {
            "type": "start",
            "result": self.result
        }


async def start_event_handler(event: Dict, player: Player, game_mgr: GameManager, card_mgr: CardManager) -> None:
    logging.info(f"{player}: ('start') Handling event.")

    if player.game_id is None:
        logging.info(f"{player}: ('start') Not in a room.")
    else:
        game = game_mgr.get_game(player.game_id)

        if game is not None:
            if game.is_can_play():
                if game.players[0] == player:
                    game.game_state = GameState.TURN

                    for game_player in game.players:
                        drawn_card_ids = random.sample(card_mgr.deck_card_ids, k=5)
                        game.players_hand[game_player] = drawn_card_ids

                        drawn_cards = [card_mgr.cards[drawn_card_id] for drawn_card_id in drawn_card_ids]
                        logging.info(f"{game_player}: ('start') Draw {', '.join([str(c) for c in drawn_cards])}.")

                        await game_player.send_event(StartServerEvent(True).to_dict())
                        await game_player.send_event(DrawActionPlayServerEvent(True, drawn_cards).to_dict())
                        await game_player.send_event(TurnActionPlayServerEvent(True, game.players[game.player_turn_no].name).to_dict())
                else:
                    logging.info(f"{player}: ('start') Player is not host of {game}. Skipping.")
            else:
                logging.info(f"{player}: ('start') Cannot start {game}. Too little players.")
        else:
            logging.info(f"{player}: ('start') Player not in a valid room.")
