"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export enum SquareState {
  Empty,
  Black,
  White,
  Preview,
}

export enum GameState {
  Init = "Init",
  BlackTurn = "Black Turn",
  WhiteTurn = "White Turn",
  BlackWin = "Black Win",
  WhiteWin = "White Win",
  Draw = "Draw",
}

type BoardProps = {
  board: SquareState[][];
  gameState: GameState;
  players: { id: string; color: string; username: string }[];
  scores: { black: number; white: number };
  updateBoard: (pos: { x: number; y: number }) => void;
  skipTurn: () => void;
  resetBoard: () => void;
  concede: () => void;
};

export default function HollowBoard({
  board,
  gameState,
  scores,
  players,
  updateBoard,
  skipTurn,
  resetBoard,
  concede,
}: BoardProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <Card className=" flex flex-col">
        <CardHeader>
          <CardTitle>
            <span className="text-2xl">{gameState}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 gap-2">
          <span
            className={cn(
              "text-2xl",
              players.find((player) =>
                player.color === "white" ? "font-bold" : "",
              ),
            )}
          >
            White {players.find((player) => player.color === "white")?.username}
            : {scores.white}
          </span>
          <div className="grid flex-1 grid-cols-1   w-fit gap-2 grid-rows-8 p-2 rounded-md bg-blue-300">
            {board.map((row, row_index) => (
              <div key={row_index} className="grid gap-2 grid-cols-8">
                {row.map((col, col_index) => (
                  <Square
                    updateBoard={() =>
                      updateBoard({ x: col_index, y: row_index })
                    }
                    state={col}
                    key={col_index}
                  />
                ))}
              </div>
            ))}
          </div>
          <span
            className={cn(
              "text-2xl",
              players.find((player) =>
                player.color === "black" ? "font-bold" : "",
              ),
            )}
          >
            Black {players.find((player) => player.color === "black")?.username}
            : {scores.black}
          </span>
          <div className=" flex justify-evenly w-full">
            <Button variant={"secondary"} onClick={skipTurn}>
              Skip Turn
            </Button>
            <Button variant={"destructive"} onClick={resetBoard}>
              Reset
            </Button>
            <Button variant={"destructive"} onClick={concede}>
              Concede
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function Square({
  updateBoard,
  state,
}: {
  updateBoard: () => void;
  state: SquareState;
}) {
  const getSquareColor = () => {
    switch (state) {
      case SquareState.Black:
        return "bg-black";
      case SquareState.White:
        return "bg-white";
      case SquareState.Preview:
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <span
      onClick={updateBoard}
      className={cn(
        "min-w-8 max-w-16 min-h-8 max-h-16 lg:min-h-16 lg:h-16 lg:min-w-16 lg:w-16",
        getSquareColor(),
      )}
    ></span>
  );
}
