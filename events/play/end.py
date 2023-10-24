from typing import Dict


class EndActionPlayServerEvent:
    def __init__(self, result: bool, player_win: str):
        self.result = result
        self.player_win = player_win

    def to_dict(self) -> Dict:
        return {
            "type": "play",
            "action": "end",
            "result": self.result,
            "playerWin": self.player_win
        }
