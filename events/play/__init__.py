import logging
from typing import Dict, Callable, Awaitable

from card import CardManager
from events.play.attack import attack_action_handler
from events.play.counter import counter_action_handler
from events.play.defend import defend_action_handler
from events.play.skip import skip_action_handler
from game import Game, GameManager, GameState
from player import Player

action_handlers: Dict[str, Callable[[Dict, Player, Game, CardManager], Awaitable[None]]] = {
    "attack": attack_action_handler,
    "defend": defend_action_handler,
    "counter": counter_action_handler,
    "skip": skip_action_handler
}


async def play_event_handler(event: dict, player: Player, game_mgr: GameManager, card_mgr: CardManager) -> None:
    logging.info(f"{player}: ('play') Handling event.")

    if player.game_id is None:
        logging.info(f"{player}: ('play') Not in a room. Skipping.")
    else:
        game = game_mgr.get_game(player.game_id)

        if game is not None:
            if game.game_state is GameState.END:
                logging.info(f"{player}: ('play') {game} has already ended. Skipping.")
                return

            if "action" not in event:
                logging.info(f"{player}: ('play') Missing values. Skipping.")
                return
            action = event["action"]

            if action in action_handlers:
                await action_handlers[action](event, player, game, card_mgr)
            else:
                logging.info(f"{player}: ('play') Unknown action ~{action}~. Skipping.")
        else:
            logging.info(f"{player}: ('play') Player not in a valid room. Skipping.")
