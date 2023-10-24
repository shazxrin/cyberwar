import logging
from typing import Optional, Dict

from card import CardManager
from game import GameManager
from player import Player


class CreateServerEvent:
    def __init__(self,
                 result: bool,
                 game_id: Optional[int],
                 game_name: Optional[str]):
        self.result = result
        self.game_id = game_id
        self.game_name = game_name

    def to_dict(self) -> Dict:
        return {
            "type": "create",
            "result": self.result,
            "gameId": self.game_id,
            "gameName": self.game_name
        }


async def create_event_handler(event: Dict, player: Player, game_mgr: GameManager, card_mgr: CardManager) -> None:
    logging.info(f"{player}: ('create') Handling event.")

    if player.game_id is None:
        if "gameName" not in event:
            logging.info(f"{player}: ('create') Missing values. Skipping.")
            return

        game_name = event["gameName"]

        created_game = game_mgr.create_game(game_name, player)
        player.game_id = created_game.game_id

        await player.send_event(CreateServerEvent(True, created_game.game_id, created_game.game_name).to_dict())
        logging.info(f"{player}: ('create') Created {created_game}.")
    else:
        logging.info(f"{player}: ('create') Already in a room.")
        await player.send_event(CreateServerEvent(False, None, None).to_dict())
