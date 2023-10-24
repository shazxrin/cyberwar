import json
import websockets.legacy.server as websockets

from typing import Optional, Dict


class Player:
    def __init__(self, ws: websockets.WebSocketServerProtocol, name: str) -> None:
        self.ws = ws
        self.name = name
        self.game_id: Optional[int] = None

    async def send_event(self, event: Dict) -> None:
        await self.ws.send(json.dumps(event))

    def __str__(self) -> str:
        return f"[{self.name}]"
