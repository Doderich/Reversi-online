"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

enum SquareState {
    Empty,
    Black,
    White,
    Preview
}

enum GameState {
    BlackTurn = 'Black Turn',
    WhiteTurn = 'White Turn',
    BlackWin = 'Black Win',
    WhiteWin = 'White Win',
    Draw= 'Draw'
}

export default function Board() {
    const [board, setBoard] = useState<SquareState[][]>(Array(8).fill(Array(8).fill(SquareState.Empty)));
    const [gameState, setGameState] = useState<GameState>(GameState.BlackTurn);
    const [currentlegalMoves, setCurrentLegalMoves] = useState<{x: number, y: number}[]>([]);
    const [scores, setScores] = useState<{black: number, white: number}>({black: 0, white: 0});

    useEffect(() => {
        resetBoard();
    }, []);

    const updateBoard = ({x, y}: {x: number, y: number}) => {
        if (board[y][x] !== SquareState.Empty && board[y][x] !== SquareState.Preview) return;
        if (gameState === GameState.BlackWin || gameState === GameState.WhiteWin || gameState === GameState.Draw) return;
        if(!currentlegalMoves.some(move => move.x === x && move.y === y)) return;

        const player = gameState === GameState.BlackTurn ? SquareState.Black : SquareState.White;
        let newBoard = board.map(row => row.slice());
        newBoard[y][x] = player;

        const directions = [{x: 0, y: 1}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 1, y: -1}, {x: -1, y: 1}, {x: -1, y: -1}, {x: 0, y: -1}, {x: -1, y: 0}];
        
        directions.forEach(({x: dx, y: dy}) => {
            newBoard = flipPieces(newBoard, x, y, dx, dy, player);
        });

        const newGameState = checkState(newBoard);
        setScores({black: newGameState.black, white: newGameState.white});

        const legalMoves = getLegalMoves(newBoard, newGameState.state);
        const highlightedBoard = highlightLegalMoves(newBoard, legalMoves);

        setCurrentLegalMoves(legalMoves);
        setBoard(highlightedBoard);
        setGameState(newGameState.state);
    };

    const resetBoard = () => {
        const newBoard: SquareState[][] = Array.from({length: 8}, () => Array(8).fill(SquareState.Empty));
        newBoard[3][3] = SquareState.White;
        newBoard[4][4] = SquareState.White;
        newBoard[3][4] = SquareState.Black;
        newBoard[4][3] = SquareState.Black;

        const legalMoves = getLegalMoves(newBoard, GameState.BlackTurn);
        const highlightedBoard = highlightLegalMoves(newBoard, legalMoves);
        setCurrentLegalMoves(legalMoves);
        setBoard(highlightedBoard);
        setGameState(GameState.BlackTurn);
    };

    const skipTurn = () => {
        const newGameState = gameState === GameState.BlackTurn ? GameState.WhiteTurn : GameState.BlackTurn;
        const legalMoves = getLegalMoves(board, newGameState);
        const highlightedBoard = highlightLegalMoves(board, legalMoves);

        setCurrentLegalMoves(legalMoves);
        setBoard(highlightedBoard);
        setGameState(newGameState);
    };

   const getLegalMoves = (board: SquareState[][], gameState: GameState): {x: number, y: number}[] => {
    const legalMoves: {x: number, y: number}[] = [];
    const directions = [
        {dx: 0, dy: 1}, {dx: 1, dy: 0}, {dx: 1, dy: 1}, {dx: 1, dy: -1}, 
        {dx: -1, dy: 1}, {dx: -1, dy: -1}, {dx: 0, dy: -1}, {dx: -1, dy: 0}
    ];
    const player = gameState === GameState.BlackTurn ? SquareState.Black : SquareState.White;
    const opponent = gameState === GameState.BlackTurn ? SquareState.White : SquareState.Black;

    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            if (board[row][col] !== SquareState.Empty) continue;

            for (const {dx, dy} of directions) {
                let x = col + dx;
                let y = row + dy;
                let hasOpponentBetween = false;

                while (x >= 0 && x < 8 && y >= 0 && y < 8 && board[y][x] === opponent) {
                    x += dx;
                    y += dy;
                    hasOpponentBetween = true;
                }

                if (hasOpponentBetween && x >= 0 && x < 8 && y >= 0 && y < 8 && board[y][x] === player) {
                    legalMoves.push({x: col, y: row});
                    break;
                }
            }
        }
    }

    return legalMoves;
};




    const highlightLegalMoves = (board: SquareState[][], legalMoves: {x: number, y: number}[]): SquareState[][] => {
        const newBoard = board.map(row => row.slice()).map(row => row.map(col => col === SquareState.Preview ? SquareState.Empty : col));

        legalMoves.forEach(move => {
            newBoard[move.y][move.x] = SquareState.Preview;
        });
        return newBoard;
    };

    const flipPieces = (board: SquareState[][], x: number, y: number, dx: number, dy: number, player: SquareState): SquareState[][] => {
        const newBoard = board.map(row => row.slice());
        const opponent = player === SquareState.Black ? SquareState.White : SquareState.Black;
        let nx = x + dx;
        let ny = y + dy;

        const toFlip: {x: number, y: number}[] = [];

        while (nx >= 0 && nx < 8 && ny >= 0 && ny < 8 && newBoard[ny][nx] === opponent) {
            toFlip.push({x: nx, y: ny});
            nx += dx;
            ny += dy;
        }

        if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8 && newBoard[ny][nx] === player) {
            toFlip.forEach(pos => {
                newBoard[pos.y][pos.x] = player;
            });
        }

        return newBoard;
    };

    const checkState = (board: SquareState[][]): {state: GameState, black: number, white: number} => {
        let black = 0;
        let white = 0;
        let currentState: GameState;
        board.forEach((row) => {
            row.forEach((col) => {
                if (col === SquareState.Black) {
                    black++;
                } else if (col === SquareState.White) {
                    white++;
                }
            });
        });
        if (black + white < 64) {
            return {state: gameState === GameState.BlackTurn ? GameState.WhiteTurn : GameState.BlackTurn, black: black, white: white};
        } else {
            if (black > white) {
                currentState = GameState.BlackWin;
            } else if (black < white) {
                currentState = GameState.WhiteWin;
            } else {
                currentState = GameState.Draw;
            }
        }
        return {state: currentState, black: black, white: white};
    };

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
