import asyncio
import json
import logging
from json import JSONDecodeError
from typing import Dict, Callable, Awaitable, Optional

import aiohttp
from aiohttp import web, WSMsgType
from aiohttp.web import Request, Response
from aiohttp.web_fileresponse import FileResponse
from aiohttp.web_ws import WebSocketResponse

from card import CardManager
from events.create import create_event_handler
from events.join import join_event_handler
from events.leave import leave_event_handler
from events.play import play_event_handler
from events.search import search_event_handler
from events.signin import SignInEvent
from events.start import start_event_handler
from game import GameManager
from player import Player


class App:
    def __init__(self):
        self.game_mgr = GameManager()
        self.card_mgr = CardManager()
        self.event_handlers: Dict[str, Callable[[Dict, Player, GameManager, CardManager], Awaitable[None]]] = {
            "create": create_event_handler,
            "search": search_event_handler,
            "join": join_event_handler,
            "leave": leave_event_handler,
            "start": start_event_handler,
            "play": play_event_handler
        }

    async def websocket_handler(self, request: Request) -> WebSocketResponse:
        ws = WebSocketResponse()
        await ws.prepare(request)

        # == handle player events ==
        player: Optional[Player] = None
        has_error = False
        async for msg in ws:
            if msg.type == WSMsgType.TEXT:
                try:
                    event = json.loads(msg.data)
                except JSONDecodeError:
                    logging.info(f"{player}: ('event') Invalid event format sent. Skipping.")
                    continue

                if "type" not in event:
                    logging.info(f"{player}: ('event') Invalid event format sent. Skipping.")
                    continue

                event_type = event["type"]
                logging.info(f"{player}: ('event') Sent event '{event_type}'")

                if event_type == "signin":
                    if "playerName" not in event:
                        logging.info("[Unknown]: ('signin') Missing values. Skipping.")
                        continue

                    player_name = event["playerName"]
                    player = Player(ws, player_name)

                    logging.info(f"{player}: ('signin') Signed in.")
                    await player.send_event(SignInEvent(True).to_dict())
                elif event_type in self.event_handlers:
                    await self.event_handlers[event_type](event, player, self.game_mgr, self.card_mgr)
                else:
                    logging.info(f"{player}: ('event') Unknown event '{event_type}'. Skipping.")
            elif msg.type == WSMsgType.ERROR:
                has_error = True
                logging.info(f"{player}: ('event') Error in websocket: {ws.exception()}")

        #  == handle player disconnect ==
        if not has_error and player is not None:
            logging.info(f"{player}: ('logout') Logging out.")
            # leave room if player is in any
            if player.game_id is not None:
                await leave_event_handler({"type": "leave"}, player, self.game_mgr, self.card_mgr)

            logging.info(f"{player}: ('logout') Logged out.")

        return ws

    async def index_handler(self, request: Request) -> FileResponse:
        return FileResponse("./www/index.html")

    def run(self):
        logging.info("Retrieving latest card definitions")
        self.card_mgr.fetch_from_database()

        app = web.Application()
        app.add_routes([
            web.get("/ws", self.websocket_handler),
            web.get("/", self.index_handler),
            web.static("/static", "./www")
        ])
        web.run_app(app)


if __name__ == "__main__":
    logging.basicConfig(format="%(asctime)s: %(message)s", level=logging.INFO)

    logging.info("Application started")
    try:
        App().run()
    except KeyboardInterrupt:
        logging.info("Application ended")
