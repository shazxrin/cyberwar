import asyncio
import json
import logging
import websockets.legacy.server as websockets
from json import JSONDecodeError
from typing import Dict, Callable, Awaitable

from websockets.exceptions import ConnectionClosedOK

from card import CardManager
from events.create import create_event_handler
from events.join import join_event_handler
from events.leave import leave_event_handler, LeaveServerEvent
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

    async def __ws_handler__(self, ws: websockets.WebSocketServerProtocol) -> None:
        # == handle player connect ==
        try:
            data = await ws.recv()
        except ConnectionClosedOK:
            return

        try:
            event = json.loads(data)
        except JSONDecodeError:
            logging.info("[Unknown]: ('signin') Invalid event format sent. Closing.")
            await ws.close(code=1002, reason="Invalid signin data sent.")
            return

        if "type" not in event:
            logging.info("[Unknown]: ('signin') Invalid event format sent. Closing.")
            await ws.close(code=1002, reason="Invalid signin data sent.")
            return

        # register player on connect
        if event["type"] != "signin":
            logging.info("[Unknown]: ('signin') Type is not signin. Closing.")
            await ws.close(code=1002, reason="Invalid signin data sent.")
            return

        if "playerName" not in event:
            logging.info("[Unknown]: ('signin') Missing values. Skipping.")
            await ws.close(code=1002, reason="Invalid signin data sent.")
            return

        player_name = event["playerName"]
        player = Player(ws, player_name)

        logging.info(f"{player}: ('signin') Signed in.")
        await player.send_event(SignInEvent(True).to_dict())

        # == handle player events ==
        async for data in ws:
            try:
                event = json.loads(data)
            except JSONDecodeError:
                logging.info(f"{player}: ('event') Invalid event format sent. Skipping.")
                continue

            if "type" not in event:
                logging.info(f"{player}: ('event') Invalid event format sent. Skipping.")
                continue

            event_type = event["type"]
            logging.info(f"{player}: ('event') Sent event '{event_type}'")

            if event_type in self.event_handlers:
                await self.event_handlers[event_type](event, player, self.game_mgr, self.card_mgr)
            else:
                logging.info(f"{player}: ('event') Unknown event '{event_type}'. Skipping.")

        #  == handle player disconnect ==
        logging.info(f"{player}: ('logout') Logging out.")
        # leave room if player is in any
        if player.game_id is not None:
            await leave_event_handler({"type": "leave"}, player, self.game_mgr, self.card_mgr)

        logging.info(f"{player}: ('logout') Logged out.")

    async def run(self):
        logging.info("Retrieving latest card definitions")
        self.card_mgr.fetch_from_database()

        async with websockets.serve(self.__ws_handler__, "localhost", 9099):
            await asyncio.Future()


if __name__ == "__main__":
    logging.basicConfig(format="%(asctime)s: %(message)s", level=logging.INFO)

    logging.info("Application started")
    try:
        asyncio.run(App().run())
    except KeyboardInterrupt:
        logging.info("Application ended")
