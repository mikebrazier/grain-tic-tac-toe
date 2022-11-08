import { EventEmitter } from 'stream'
import {TicTacToeGame, TimedTicTacToeGame} from './TicTacToe'
import { User } from './UserManager'
import { uid } from 'uid';

class TimedTicTacToeGameWithUsers {

}

export enum GameManagerEvents {
    NEW_GAMES = 'NEW_GAMES'
}

export class GameManager extends EventEmitter {
    games : Record<string, TimedTicTacToeGameWithUsers> = {}

    createGame()
    {
        const game = new TimedTicTacToeGameWithUsers()
        const id = uid()
        this.games[id] = game
        this.emit(GameManagerEvents.NEW_GAMES)
        return { game, id }
    }

    deleteGame(id: string) : void
    {
        delete this.games[id]
        this.emit(GameManagerEvents.NEW_GAMES)
    }
}