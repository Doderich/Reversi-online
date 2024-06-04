import { GameState, resetBoard, skipTurn, SquareState, updateBoard } from "./lib/reversi-logic";

// server/server.js
const http = require('http');

const server = http.createServer((req, res) => {
  // Handle HTTP requests if needed
});


const waitingPlayers: string[] = [];
const games: {game_id: string; players:{id: string; color: string;}[]; scores: {black:number; white:number};  board: SquareState[][]; game_state:GameState; legalMoves: {x:number; y:number}[] }[] = [];

const { Server } = require('socket.io');
const io = new Server(server,{
    cors: {
    origin: '*',
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
    const { id } = socket
    console.log(`A user connected with id: ${id}`);

    socket.on('join game', ({game_id}) => {
        console.log(`User ${id} joined game ${game_id}`)
        const game = games.find(game => game.game_id === game_id)
        if(!game) return
        if(game.players.length >= 2) return
        if(game.players.find(player => player.id === id)) return
        game.players.push({id, color: game.players.length === 0 ? 'black' : 'white', score: '2'})
        game.game_state = GameState.Init
        game.board= []
        socket.join(game_id)
        io.to(game_id).emit('joined game', game)
    })
    
    socket.on('waiting', () => {
        if(waitingPlayers.find(player => player === socket.id)) return
        waitingPlayers.push(id)
        socket.join('waiting-room')
        io.to('waiting-room').emit('waiting players', {waitingPlayers})
        console.log(waitingPlayers)
    })

    setInterval(() => {
        const filteredPlayers= waitingPlayers.reduce((acc, player) => {
            if(!acc.includes(player)){
                acc.push(player)
            }
            return acc
        }, [])

        if(filteredPlayers.length < 2) return

        const players = filteredPlayers.splice(0, 2)
        waitingPlayers.splice(0, 2)
        io.to('waiting-room').emit('waiting players', {waitingPlayers})
        const game_id = Math.random().toString(16).slice(2)
        const newGame = {game_id, players: [], game_state: 'init'}
        games.push(newGame)
        io.to(players[0]).emit('match found', newGame)
        io.to(players[1]).emit('match found', newGame)
    }, 1000);
    
    socket.on('start game', ({game_id}) => {
        const game = games.find(game => game.game_id === game_id)
        if(!game) return
        const {legalMoves, gameState, board }=resetBoard()
        game.legalMoves = legalMoves
        game.game_state = gameState
        game.board = board
        game.scores = {black: 2, white: 2}
        io.to(game_id).emit('game started', game)
    })

    socket.on('update board', ({game_id, x, y}) => {
        const game = games.find(game => game.game_id === game_id)
        if(!game) return
        if(!game.legalMoves.find(move => move.x === x && move.y === y)) return
        const newBoard = updateBoard({board:game.board, gameState:game.game_state, currentlegalMoves:game.legalMoves, x, y})
        if(!newBoard) return
        game.board = newBoard.board
        game.game_state = newBoard.gameState.state
        game.legalMoves = newBoard.legalMoves
        game.scores = newBoard.scores
        io.to(game_id).emit('board updated', game)
    })

    socket.on('skip turn', ({game_id}) => {
        const game = games.find(game => game.game_id === game_id)
        if(!game) return
        const newBoard = skipTurn({gameState:game.game_state, board:game.board})
        game.board = newBoard.board
        game.game_state = newBoard.gameState
        game.legalMoves = newBoard.legalMoves
        io.to(game_id).emit('board updated', game)
    })

    socket.on('reset board', ({game_id}) => {
        const game = games.find(game => game.game_id === game_id)
        if(!game) return
        const {legalMoves, gameState, board }=resetBoard()
        game.legalMoves = legalMoves
        game.game_state = gameState
        game.board = board
        game.scores = {black: 2, white: 2}
        io.to(game_id).emit('board updated', game)
    })

    socket.on('concede', ({game_id}) => {
        const game = games.find(game => game.game_id === game_id)
        if(!game) return
        game.game_state = game.game_state === GameState.BlackTurn ? GameState.WhiteWin : GameState.BlackWin
        io.to(game_id).emit('game ended', game)
    })


    socket.on('disconnect', () => {
        console.log('A user disconnected');
        const index = waitingPlayers.indexOf(id)
        waitingPlayers.splice(index, 1)
        io.to('waiting-room').emit('waiting players', {waitingPlayers})
  });

});

server.listen(process.env.PORT, () => {
  console.log(`WebSocket server listening on port ${process.env.PORT}`);
});