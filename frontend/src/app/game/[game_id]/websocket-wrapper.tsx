"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import HollowBoard, { GameState, SquareState } from "./hollow-board";
import { io } from "socket.io-client";
import Link from "next/link";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";

type Game = {
  game_id: string;
  players: { id: string; color: string; username: string; current: boolean }[];
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
  const [openGameEndDialog, setOpenGameEndDialog] = useState(false);
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
  const [socketId, setSockedId] = useState("");
  useEffect(() => {
    socket.emit("join game", {
      game_id: gameId,
      username: localStorage.getItem("username"),
    });
    setSockedId(socket.id);
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
      if (
        game.game_state === GameState.BlackWin ||
        game.game_state === GameState.WhiteWin ||
        game.game_state === GameState.Draw
      ) {
        console.log("Game ended", game);
        setOpenGameEndDialog(true);
      }
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
  const resetBoard = (newGame: boolean = false) => {
    if (
      !newGame &&
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
      <Dialog open={openGameEndDialog} onOpenChange={setOpenGameEndDialog}>
        <DialogContent>
          <div>{game.game_state}</div>
          <div>Black: {game.scores.black}</div>
          <div>White: {game.scores.white}</div>
          <DialogFooter>
            <DialogClose>
              <Button
                onClick={() => {
                  resetBoard(true);
                }}
              >
                New Game
              </Button>
            </DialogClose>
            <DialogClose>
              <Button asChild>
                <Link href={"/waiting"}>Go to Waiting area</Link>
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="w-full p-6 flex justify-center">
        <span className="text-5xl font-bold">Reversi</span>
      </div>
      <div className="flex flex-1 col justify-center items-center">
        {game.players.length == 0 && (
          <Button variant={"link"} asChild>
            <Link href="/waiting" className="text-xl text-wrap">
              There has been an error, please go to the back to the waiting area
            </Link>
          </Button>
        )}
        {game.players.length == 1 && (
          <span className="text-xl text-wrap">
            Waiting for other player ...
          </span>
        )}
        {game.game_state === GameState.Init && game.players.length == 2 && (
          <div className="flex flex-col gap-2">
            <span className="text-xl text-wrap">
              Player 1: {game.players[0].username} {game.players[0].color}
            </span>
            <span className="text-xl text-wrap">
              Player 2: {game.players[1].username} {game.players[1].color}
            </span>
            <Button onClick={startGame}>Start Game</Button>
          </div>
        )}
        {game.game_state !== GameState.Init && game.players.length === 2 && (
          <HollowBoard
            board={game.board}
            players={game.players.map((player) => {
              return { ...player, current: player.id === socketId };
            })}
            scores={{ black: 2, white: 2 }}
            gameState={game.game_state}
            updateBoard={updateBoard}
            skipTurn={skipTurn}
            resetBoard={resetBoard}
            concede={concede}
          />
        )}
      </div>
    </div>
  );
}
