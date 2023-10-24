import logging
from typing import Optional, List, Dict

from card import CardManager
from game import GameManager, GameState
from player import Player


class JoinServerEvent:
    def __init__(self,
                 result: bool,
                 player_join: Optional[str] = None,
                 game_id: Optional[int] = None,
                 game_name: Optional[str] = None,
                 host: Optional[str] = None,
                 players: Optional[List[str]] = None,
                 is_can_start: Optional[bool] = None):
        self.result = result
        self.player_join = player_join
        self.game_id = game_id
        self.game_name = game_name
        self.host = host
        self.players = players
        self.is_can_start = is_can_start

    def to_dict(self) -> Dict:
        return {
            "type": "join",
            "result": self.result,
            "playerJoin": self.player_join,
            "gameId": self.game_id,
            "gameName": self.game_name,
            "host": self.host,
            "players": self.players,
            "isCanStart": self.is_can_start
        }


async def join_event_handler(event: Dict, player: Player, game_mgr: GameManager, card_mgr: CardManager) -> None:
    logging.info(f"{player}: ('join') Handling event.")

    if player.game_id is None:
        if "gameId" not in event:
            logging.info(f"[{player.name}]: ('join') Missing values. Skipping.")
            return

        game_id = event["gameId"]

        game = game_mgr.get_game(game_id)

        if game is not None:
            if game.game_state == GameState.WAITING and not game.is_full():
                game.join(player)
                player.game_id = game_id

                for game_player in game.players:
                    await game_player.send_event(
                        JoinServerEvent(
                            True,
                            player.name,
                            game.game_id,
                            game.game_name,
                            game.host.name,
                            [game_player.name for game_player in game.players],
                            game.is_can_play()
                        ).to_dict()
                    )

                logging.info(f"{player}: ('join') Joined {game}.")
            else:
                logging.info(f"{player}: ('join') Room in play or full.")
        else:
            logging.info(f"{player}: ('join') Invalid room {game_id}.")
            await player.send_event(
                JoinServerEvent(False).to_dict())
    else:
        logging.info(f"{player}: ('join') Already in a room.")
        await player.send_event(
            JoinServerEvent(False).to_dict())
