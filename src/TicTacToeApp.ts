import { UserManager } from './UserManager'
import { GameManager } from './GameManager'

export class TicTacToeApp {
    users : UserManager
    games : GameManager

    constructor(){
        this.users = new UserManager()
        this.games = new GameManager()
    }
}