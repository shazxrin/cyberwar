from typing import Optional, Dict

from aiohttp.web_ws import WebSocketResponse


class Player:
    def __init__(self, ws: WebSocketResponse, name: str) -> None:
        self.ws = ws
        self.name = name
        self.game_id: Optional[int] = None

    async def send_event(self, event: Dict) -> None:
        await self.ws.send_json(event)

    def __str__(self) -> str:
        return f"[{self.name}]"
