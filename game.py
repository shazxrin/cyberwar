import logging
from enum import Enum
from typing import List, Dict, Optional
from player import Player
from card import Card, CardCategory


class GameState(Enum):
    WAITING = 0
    TURN = 1
    ATTACK = 2
    DEFEND = 3
    COUNTER = 4
    TRIVIA = 5
    END = 6


class Game:
    PLAYER_LIMIT = 2
    WIN_SCORE_PER_CATEGORY = 1

    def __init__(self, game_id: int, game_name: str, host: Player) -> None:
        self.game_id = game_id
        self.game_name = game_name
        self.game_state = GameState.WAITING

        self.host: Player = host
        self.players: List[Player] = []
        self.player_turn_no = 0

        self.players_scores: Dict[Player, Dict[CardCategory, int]] = {}

        self.players_hand: Dict[Player, List[int]] = {}
        self.discarded: Optional[Card] = None

        self.join(host)

    def join(self, player: Player):
        assert self.game_state == GameState.WAITING and len(self.players) < self.PLAYER_LIMIT
        self.players.append(player)
        self.players_hand[player] = []
        self.players_scores[player] = {
            CardCategory.RED: 0,
            CardCategory.BLUE: 0,
            CardCategory.ORANGE: 0,
        }
        logging.info(f"{self}: {player} added.")

    def leave(self, player: Player):
        self.players.remove(player)
        del self.players_hand[player]
        del self.players_scores[player]
        logging.info(f"{self}: {player} removed.")

    def get_winner(self) -> Optional[Player]:
        player_win = None
        for player, scores in self.players_scores.items():
            is_red_win = scores[CardCategory.RED] >= self.WIN_SCORE_PER_CATEGORY
            is_orange_win = scores[CardCategory.ORANGE] >= self.WIN_SCORE_PER_CATEGORY
            is_blue_win = scores[CardCategory.BLUE] >= self.WIN_SCORE_PER_CATEGORY
            if is_red_win and is_orange_win and is_blue_win:
                player_win = player
        return player_win

    def is_can_play(self):
        return len(self.players) > 1

    def is_empty(self):
        return len(self.players) == 0

    def is_full(self):
        return len(self.players) == self.PLAYER_LIMIT

    def is_in_progress(self):
        return self.game_state != GameState.WAITING

    def __str__(self):
        return f"<{self.game_id} @ {self.game_name}>"


class GameManager:
    def __init__(self) -> None:
        self.game_id_counter = 0
        self.games: Dict[int, Game] = dict()

    def create_game(self, game_name: str, host: Player) -> Game:
        new_game = Game(self.game_id_counter, game_name, host)
        self.games[self.game_id_counter] = new_game
        self.game_id_counter += 1

        logging.info(f"[Game Manager]: {new_game} has been created.")

        return new_game

    def get_game(self, game_id: int) -> Optional[Game]:
        if game_id in self.games:
            return self.games[game_id]
        else:
            return None

    def remove_game(self, game_id: int) -> None:
        del_game = self.games[game_id]
        logging.info(f"[Game Manager]: {del_game} will be removed.")
        del self.games[game_id]
