import logging
from typing import Optional, Dict, List

from card import CardManager
from game import GameManager, GameState
from player import Player


class LeaveServerEvent:
    def __init__(self,
                 result: bool,
                 player_leave: Optional[str] = None,
                 game_id: Optional[int] = None,
                 game_name: Optional[str] = None,
                 host: Optional[str] = None,
                 players: Optional[List[str]] = None,
                 is_can_start: Optional[bool] = None):
        self.result = result
        self.player_leave = player_leave
        self.game_id = game_id
        self.game_name = game_name
        self.host = host
        self.players = players
        self.is_can_start = is_can_start

    def to_dict(self) -> Dict:
        return {
            "type": "leave",
            "result": self.result,
            "playerLeave": self.player_leave,
            "gameId": self.game_id,
            "gameName": self.game_name,
            "host": self.host,
            "players": self.players,
            "isCanStart": self.is_can_start
        }


async def leave_event_handler(event: Dict, player: Player, game_mgr: GameManager, card_mgr: CardManager) -> None:
    logging.info(f"{player}: ('leave') Handling event.")

    if player.game_id is None:
        logging.info(f"{player}: ('leave') Not in a room.")
        await player.send_event(LeaveServerEvent(False).to_dict())
    else:
        game = game_mgr.get_game(player.game_id)

        if game is not None:
            game.leave(player)
            player.game_id = None

            logging.info(f"{player}: ('leave') Left {game}.")

            is_host_left_game_waiting = game.game_state == GameState.WAITING and game.host not in game.players
            is_not_enough_players_game_ongoing = game.game_state != GameState.WAITING and not game.is_can_play()
            is_game_closed = game.is_empty() or is_host_left_game_waiting or is_not_enough_players_game_ongoing
            if is_game_closed:
                if game.is_empty():
                    logging.info(f"{player}: ('leave') Closing {game} because empty")
                elif is_host_left_game_waiting:
                    logging.info(f"{player}: ('leave') Closing {game} because host left waiting game")
                elif is_not_enough_players_game_ongoing:
                    logging.info(f"{player}: ('leave') Closing {game} because not enough players ongoing game")

            for game_player in game.players:
                await game_player.send_event(
                    LeaveServerEvent(
                        True,
                        player.name,
                        game.game_id,
                        game.game_name,
                        game.host.name,
                        [game_player.name for game_player in game.players],
                        game.is_can_play()
                    ).to_dict()
                )

                if is_game_closed:
                    game.leave(game_player)
                    game_player.game_id = None
                    await game_player.send_event(LeaveServerEvent(True, game_player.name).to_dict())

            if is_game_closed:
                game_mgr.remove_game(game.game_id)

            await player.send_event(LeaveServerEvent(True, player.name).to_dict())
        else:
            player.game_id = None
            await player.send_event(LeaveServerEvent(False).to_dict())
