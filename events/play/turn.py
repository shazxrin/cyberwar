from typing import Dict


class TurnActionPlayServerEvent:
    def __init__(self, result: bool, player_turn: str):
        self.result = result
        self.player_turn = player_turn

    def to_dict(self) -> Dict:
        return {
            "type": "play",
            "action": "turn",
            "result": self.result,
            "playerTurn": self.player_turn
        }
