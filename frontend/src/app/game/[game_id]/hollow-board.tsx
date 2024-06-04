"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export enum SquareState {
    Empty,
    Black,
    White,
    Preview
}

export enum GameState {
    Init = 'Init',
    BlackTurn = 'Black Turn',
    WhiteTurn = 'White Turn',
    BlackWin = 'Black Win',
    WhiteWin = 'White Win',
    Draw= 'Draw'
}

type BoardProps = {board:SquareState[][], gameState: GameState, scores: {black: number, white: number}, updateBoard: (pos: {x: number, y: number}) => void, skipTurn: () => void, resetBoard: () => void, concede: () => void}

export default function HollowBoard({board, gameState, scores, updateBoard, skipTurn, resetBoard, concede}: BoardProps ){

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <span className=" text-4xl">Board</span>
            <span className="text-2xl">Black: {scores.black}</span>
            <span className="text-2xl">White: {scores.white}</span>
            <div className="grid grid-cols-1 w-fit gap-2 grid-rows-8 bg-blue-300">
                {board.map((row, row_index) => (
                    <div key={row_index} className="grid gap-2 grid-cols-8">
                        {row.map((col, col_index) => (
                            <Square updateBoard={() => updateBoard({x: col_index, y: row_index})} state={col} key={col_index} />
                        ))}
                    </div>
                ))}
            </div>
            <span className="text-2xl">{gameState}</span>
            <div className=" flex justify-evenly w-full">

            <Button variant={"secondary"} onClick={skipTurn}>Skip Turn</Button>
            <Button onClick={resetBoard}>Reset</Button>
            <Button onClick={concede}>Concied</Button>
            </div>
        </div>
    );
}

export function Square({updateBoard, state}: {updateBoard: () => void; state: SquareState}) {
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

    return <span onClick={updateBoard} className={cn("w-12 h-12", getSquareColor())}></span>;
}
