from typing import Dict


class SignInEvent:
    def __init__(self, result: bool):
        self.result = result

    def to_dict(self) -> Dict:
        return {
            "type": "signin",
            "result": self.result
        }
