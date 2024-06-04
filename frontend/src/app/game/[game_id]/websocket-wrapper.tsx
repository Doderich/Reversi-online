"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import HollowBoard, { GameState, SquareState } from "./hollow-board";
import { io } from "socket.io-client";

type Game = {
  game_id: string;
  players: { id: string; color: string }[];
  board: SquareState[][];
  game_state: GameState;
  scores: {
    black: number;
    white: number;
  };
};

export default function WebsocketWrapper({
  gameId,
  url,
}: {
  gameId: string;
  url: string;
}) {
  const socket = io(url, {
    path: "/live/reversi-server/",
  });
  const [game, setGame] = useState<Game>({
    game_id: "",
    players: [],
    board: [],
    game_state: GameState.Init,
    scores: { black: 2, white: 2 },
  });
  useEffect(() => {
    socket.emit("join game", { game_id: gameId });
    // Listen for incoming messages
    socket.on("joined game", (game: Game) => {
      setGame(game);
      console.log("Joined game", game);
    });

    socket.on("game started", (game: Game) => {
      setGame(game);
      console.log("Start game", game);
    });

    socket.on("board updated", (game: Game) => {
      setGame(game);
      console.log("Updated board", game);
    });
  }, []);

  const startGame = () => {
    socket.emit("start game", { game_id: gameId });
  };

  const updateBoard = ({ x, y }: { x: number; y: number }) => {
    if (
      game.game_state === GameState.BlackWin ||
      game.game_state === GameState.WhiteWin ||
      game.game_state === GameState.Draw
    )
      return;
    if (
      game.players.find(
        (player) =>
          player.id === socket.id &&
          player.color !== game.game_state.split(" ")[0].toLowerCase(),
      )
    )
      return;
    socket.emit("update board", { game_id: gameId, x, y });
  };
  const skipTurn = () => {
    if (
      game.game_state === GameState.BlackWin ||
      game.game_state === GameState.WhiteWin ||
      game.game_state === GameState.Draw
    )
      return;
    if (
      game.players.find(
        (player) =>
          player.id === socket.id &&
          player.color !== game.game_state.split(" ")[0].toLowerCase(),
      )
    )
      return;
    socket.emit("skip turn", { game_id: gameId });
  };
  const resetBoard = () => {
    if (
      game.game_state === GameState.BlackWin ||
      game.game_state === GameState.WhiteWin ||
      game.game_state === GameState.Draw
    )
      return;
    if (
      game.players.find(
        (player) =>
          player.id === socket.id &&
          player.color !== game.game_state.split(" ")[0].toLowerCase(),
      )
    )
      return;
    socket.emit("reset board", { game_id: gameId });
  };
  const concede = () => {
    if (
      game.game_state === GameState.BlackWin ||
      game.game_state === GameState.WhiteWin ||
      game.game_state === GameState.Draw
    )
      return;
    if (
      game.players.find(
        (player) =>
          player.id === socket.id &&
          player.color !== game.game_state.split(" ")[0].toLowerCase(),
      )
    )
      return;
    socket.emit("concede", { game_id: gameId });
  };

  return (
    <div className="w-full h-full flex justify-center items-center flex-col">
      {game.players.map((player, index) => {
        return (
          <div key={index} className="flex gap-2">
            <span className={player.id === socket.id ? " text-red-500" : ""}>
              Player {player.id}
            </span>
            <span>Color {player.color}</span>
          </div>
        );
      })}
      {game.game_state == GameState.Init ? (
        game.players.length === 2 ? (
          <Button onClick={startGame}>Start Game</Button>
        ) : (
          <span> Waiting for other player</span>
        )
      ) : (
        <HollowBoard
          board={game.board}
          scores={{ black: 2, white: 2 }}
          gameState={game.game_state}
          updateBoard={updateBoard}
          skipTurn={skipTurn}
          resetBoard={resetBoard}
          concede={concede}
        />
      )}
    </div>
  );
}
