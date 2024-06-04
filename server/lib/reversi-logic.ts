enum SquareState {
    Empty,
    Black,
    White,
    Preview
}

enum GameState {
    Init = 'Init',
    BlackTurn = 'Black Turn',
    WhiteTurn = 'White Turn',
    BlackWin = 'Black Win',
    WhiteWin = 'White Win',
    Draw= 'Draw'
}

const updateBoard = ({board,gameState,currentlegalMoves,x, y}: {board: SquareState[][], gameState: GameState; currentlegalMoves:{x:number; y:number}[];  x: number, y: number}) => {
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

        const newGameState = checkState({board:newBoard, gameState});
        const legalMoves = getLegalMoves(newBoard, newGameState.state);
        const highlightedBoard = highlightLegalMoves(newBoard, legalMoves);
        return {
            gameState:newGameState,
            legalMoves,
            scores: {black: newGameState.black, white: newGameState.white},
            board: highlightedBoard
        }
    };

    const resetBoard = () => {
        const newBoard: SquareState[][] = Array.from({length: 8}, () => Array(8).fill(SquareState.Empty));
        newBoard[3][3] = SquareState.White;
        newBoard[4][4] = SquareState.White;
        newBoard[3][4] = SquareState.Black;
        newBoard[4][3] = SquareState.Black;

        const legalMoves = getLegalMoves(newBoard, GameState.BlackTurn);
        const highlightedBoard = highlightLegalMoves(newBoard, legalMoves);
        
        return {
            legalMoves,
            board: highlightedBoard,
            gameState: GameState.BlackTurn
        }
    };

    const skipTurn = ({gameState, board}: {gameState: GameState, board: SquareState[][]}) => {
        const newGameState = gameState === GameState.BlackTurn ? GameState.WhiteTurn : GameState.BlackTurn;
        const legalMoves = getLegalMoves(board, newGameState);
        const highlightedBoard = highlightLegalMoves(board, legalMoves);
       
        return {
            legalMoves,
            board: highlightedBoard,
            gameState: newGameState
        }
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

    const checkState = ({board, gameState}: {board: SquareState[][], gameState: GameState}): {state: GameState, black: number, white: number} => {
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

export {
    SquareState,
    GameState,
    updateBoard,
    resetBoard,
    skipTurn,
    getLegalMoves,
    highlightLegalMoves,
    flipPieces,
    checkState
}