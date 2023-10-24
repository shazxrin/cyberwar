import logging
from dataclasses import dataclass
from typing import Dict, List

from card import CardManager
from game import GameManager
from player import Player


@dataclass
class GameSearchItem:
    game_id: int
    game_name: str
    player_count: int
    is_full: bool


class SearchServerEvent:
    def __init__(self, result: bool, games: List[GameSearchItem]):
        self.result = result
        self.games = games

    def to_dict(self) -> Dict:
        return {
            "type": "search",
            "result": self.result,
            "rooms": [{
                "gameId": game.game_id,
                "gameName": game.game_name,
                "playerCount": game.player_count,
                "isFull": game.is_full
            } for game in self.games]
        }


async def search_event_handler(event: Dict, player: Player, game_mgr: GameManager, card_mgr: CardManager) -> None:
    logging.info(f"{player}: ('search') Handling event.")

    await player.send_event(
        SearchServerEvent(
            True,
            [GameSearchItem(game.game_id, game.game_name, len(game.players), game.is_full()) for game in game_mgr.games.values()]
        ).to_dict()
    )
