import logging
import random
from typing import Dict, Optional

from card import CardCategory, CardManager
from events.play.draw import DrawActionPlayServerEvent
from events.play.end import EndActionPlayServerEvent
from events.play.turn import TurnActionPlayServerEvent
from game import GameState, Game
from player import Player


class SkipActionPlayServerEvent:
    def __init__(self,
                 result: bool,
                 player_skip: Optional[str] = None,
                 players_scores: Optional[Dict[str, Dict[CardCategory, int]]] = None):
        self.result = result
        self.player_skip = player_skip
        self.players_scores = players_scores

    def to_dict(self) -> Dict:
        return {
            "type": "play",
            "action": "skip",
            "result": self.result,
            "playerSkip": self.player_skip,
            "playersScores": {player: {
                "red": scores[CardCategory.RED],
                "blue": scores[CardCategory.BLUE],
                "orange": scores[CardCategory.ORANGE]
            } for player, scores in self.players_scores.items()}
        }


async def skip_action_handler(event: dict, player: Player, game: Game, card_mgr: CardManager) -> None:
    if game.game_state not in [GameState.TURN, GameState.COUNTER]:
        logging.info(f"{player}: ('play') ~skip~ Game state is not in turn or counter mode. Skipping.")
        await player.send_event(SkipActionPlayServerEvent(False).to_dict())
        return

    if game.game_state is GameState.TURN:
        logging.info(f"{player}: ('play') ~skip~ Skipping turn.")

        # update game state
        game.game_state = GameState.TURN
        game.player_turn_no = (game.player_turn_no + 1) % game.PLAYER_LIMIT

        # player draw card
        draw_card_id = random.choice(card_mgr.deck_card_ids)
        draw_card = card_mgr.cards[draw_card_id]
        game.players_hand[player].append(draw_card_id)
        await player.send_event(DrawActionPlayServerEvent(True, [draw_card]).to_dict())
        logging.info(f"{player}: ('play') ~skip~ Draw {draw_card}.")

        # update player clients
        for game_player in game.players:
            await game_player.send_event(
                SkipActionPlayServerEvent(
                    True,
                    player.name,
                    {game_player.name: scores for game_player, scores in game.players_scores.items()}
                ).to_dict()
            )
            await game_player.send_event(TurnActionPlayServerEvent(True, game.players[game.player_turn_no].name).to_dict())

    elif game.game_state is GameState.COUNTER:
        logging.info(f"{player}: ('play') ~skip~ Skipping counter.")

        if game.players[(game.player_turn_no + 1) % game.PLAYER_LIMIT].name != player.name:
            logging.info(f"{player}: ('play') ~skip~ Player not target of the attack. Skipping.")
            await player.send_event(SkipActionPlayServerEvent(False).to_dict())
            return

        player_attack = game.players[game.player_turn_no]

        # update scores
        game.players_scores[player_attack][game.discarded.card_category] += 1
        game.players_scores[player][game.discarded.card_category] -= 1

        # update game state
        game.player_turn_no = (game.player_turn_no + 1) % game.PLAYER_LIMIT
        player_winner = game.get_winner()
        game.game_state = GameState.TURN if player_winner is None else GameState.END

        # player attack draw card
        if player_winner is None:
            draw_card_id = random.choice(card_mgr.deck_card_ids)
            draw_card = card_mgr.cards[draw_card_id]
            game.players_hand[player_attack].append(draw_card_id)
            await player_attack.send_event(DrawActionPlayServerEvent(True, [draw_card]).to_dict())
            logging.info(f"{player_attack}: ('play') ~skip~ Draw {draw_card}.")

        # update player client's
        for game_player in game.players:
            await game_player.send_event(
                SkipActionPlayServerEvent(
                    True,
                    player.name,
                    {player.name: scores for player, scores in game.players_scores.items()}
                ).to_dict()
            )

            if player_winner is None:
                await game_player.send_event(TurnActionPlayServerEvent(True, game.players[game.player_turn_no].name).to_dict())
            else:
                await game_player.send_event(EndActionPlayServerEvent(True, player_winner.name).to_dict())
