import { EventEmitter } from 'stream'
import {TicTacToeGame, TimedTicTacToeGame} from './TicTacToe'
import { User } from './UserManager'
import { uid } from 'uid';
import { Grid, GridSize } from './Grid';
import { TicTacToePlayer, TicTacToeGameState } from './TicTacToe'

export interface TicTacToeGameWithUsers {
    game: TicTacToeGame,
    playerIds: string[],
    id: string
}

export interface TicTacToeGameData {
    gameData: {
        grid: Grid;
        gridSize: GridSize;
        state: TicTacToeGameState;
        turn: TicTacToePlayer | null;
        winningPlayer: TicTacToePlayer | null;
    };
    id: string;
    playerIds: string[];
}

export interface TicTacToeGameWithData {
    game: TicTacToeGameData
    games: TicTacToeGameData[];
}

export enum GameManagerEvents {
    NEW_GAMES = 'NEW_GAMES'
}

export class GameManager extends EventEmitter {
    games : Record<string, TicTacToeGameWithUsers> = {}

    makeGamesArray()
    {
        return Object.keys(this.games).map((k)=>(this.games[k]))
    }

    createGame(gridSize: GridSize = GridSize.THREE, playerOneId: string)
    {
        const game : TicTacToeGameWithUsers = { 
            game: new TicTacToeGame(gridSize),
            playerIds: [playerOneId],
            id: uid()
        }
        this.games[game.id] = game
        const games = this.makeGamesArray()
        this.emit(GameManagerEvents.NEW_GAMES, { game, games: this.makeGamesArray()})
        return { game, games }
    }

    addUserToGame(gameId: string, userId: string)
    {
        const game = this.getGameOrThrowError(gameId)

        // if game full, throw error
        if(game.playerIds.length >= 2)
        {
            throw new Error('cannot add player to full game')
        }

        this.games[gameId].playerIds.push(userId)
        const games = this.makeGamesArray()
        this.emit(GameManagerEvents.NEW_GAMES, { game, games: this.makeGamesArray()})
        return { game, games }
    }

    getGameOrThrowError(gameId: string)
    {
        const game = this.games[gameId]
        
        if(!game)
        {
            throw new Error(`game ${gameId} does not exist`)
        }

        return game
    }

    startGame( gameId: string )
    {
        const game = this.getGameOrThrowError(gameId)

        if(game.playerIds.length != 2)
        {
            throw new Error(`game needs 2 players to start (has ${game.playerIds.length}})`)
        }

        game.game.start()
        const games = this.makeGamesArray()
        this.emit(GameManagerEvents.NEW_GAMES, { game, games: this.makeGamesArray()})
        return { game, games }
    }

    executeGameTurn(gameId: string, playerId: string, x: number, y: number)
    {
        const game = this.getGameOrThrowError(gameId)

        // if player is not game player, throw error
        if( !game.playerIds.includes(playerId) )
        {
            throw new Error(`playerId '${playerId}' is not registered with game '${gameId}'`)
        }

        // else, player[0] => Player 1, player[1] => Player 2
        let playerTurn : TicTacToePlayer;
        playerId == game.playerIds[0] ? playerTurn = TicTacToePlayer.ONE : playerTurn = TicTacToePlayer.ONE

        game.game.executePlayerTurn(playerTurn, x, y)

        const games = this.makeGamesArray()
        this.emit(GameManagerEvents.NEW_GAMES, { game, games: this.makeGamesArray()})
        return { game, games }

    }

    deleteGame(id: string) : void
    {
        delete this.games[id]
        this.emit(GameManagerEvents.NEW_GAMES)
    }
}