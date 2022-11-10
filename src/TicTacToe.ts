import { EventEmitter } from 'stream';
import { Grid, GridSize, gridCreate, CellValue, gridGetCellValue, gridSetCellValue, gridCoordinatesAreWinning, gridFull } from './Grid'

export enum TicTacToePlayer {
  ONE = 1,
  TWO
}

export const TicTacToePlayerValueMap : Record<TicTacToePlayer, CellValue.X | CellValue.O> = {
  [TicTacToePlayer.ONE]: CellValue.X,
  [TicTacToePlayer.TWO]: CellValue.O,
}

export const TicTacToeValuePlayerMap : Record<CellValue.X | CellValue.O, TicTacToePlayer.ONE | TicTacToePlayer.TWO> = {
    [CellValue.X]: TicTacToePlayer.ONE,
    [CellValue.O]: TicTacToePlayer.TWO,
  }

export interface TicTacToePlayerTurn {
  // the player executing the turn
  player: TicTacToePlayer;
  x: number;
  y: number;
}

export enum TicTacToeGameState {
  NOT_STARTED = 1,
  ONGOING,
  COMPLETE
}

export enum TicTacToeGameEvents {
    START = 'START',
    TURN_EXECUTED = 'TURN_EXECUTED',
    GAME_COMPLETE = 'GAME_COMPLETE',
}

export interface TicTacToeGameStartEventArgs {
    testArg: null;
}

export class TicTacToeGame extends EventEmitter {
  grid: Grid;
  gridSize: GridSize;
  state: TicTacToeGameState = TicTacToeGameState.NOT_STARTED
  turn: TicTacToePlayer | null = null;
  winningPlayer: TicTacToePlayer | null = null;
  
  constructor(gridSize: GridSize) {
    super()
    this.gridSize = gridSize
    this.grid = gridCreate(gridSize)
  }

  isNotStarted = ():boolean=>this.state==TicTacToeGameState.NOT_STARTED
  isOngoing = ():boolean=>this.state==TicTacToeGameState.ONGOING
  isComplete = ():boolean=>this.state==TicTacToeGameState.COMPLETE
  
  getGameData(){
    return {
      grid: this.grid,
      gridSize: this.gridSize,
      state: this.state,
      turn: this.turn,
      winningPlayer: this.winningPlayer
    }
  }

  start():void{

    // TODO
    // if(
    //   this.state == TicTacToeGameState.ONGOING
    //   ||
    //   this.state == TicTacToeGameState.COMPLETE
    //   )
    //   {
    //     throw new Error(`game state cannot be started from state ${this.state}`)
    //   }

    /**
     * UPDATE STATE
     */
    this.state=TicTacToeGameState.ONGOING
    this.turn=TicTacToePlayer.ONE
    
    /**
     * EMIT EVENTS
     */
    const args : TicTacToeGameStartEventArgs = {testArg: null}
    
    // emit start event
    this.emit(TicTacToeGameEvents.START, args)
    return
  }

  executeTurn(x: number, y: number, value: CellValue.X | CellValue.O) : void {

    // throw error if game is not yet started or complete
    if(
        !this.isOngoing()
    )
    {
        throw new Error('game must be started before turn can be executed')
    }
      
    // check if value at cell is already set (!null)
    if(
        gridGetCellValue(x,y,this.grid,this.gridSize) != CellValue.NULL
    )
    {
        throw new Error('cell value already set and cannot be overwritten')
    }

    // can throw bounds error
    gridSetCellValue(x,y,this.grid,this.gridSize,value)

    // upon successful completion
    this.onTurnExecuted(x,y,value)

    return
  }

  executePlayerTurn(player: TicTacToePlayer, x: number, y: number) : void
  {

    if(this.turn != player)
    {
        throw new Error(`cannot take turn for player ${player}, current turn is ${this.turn}`)
    }

    this.executeTurn(x,y,TicTacToePlayerValueMap[player])
  }


  onTurnExecuted(x: number, y: number, value: CellValue.X | CellValue.O) : void {
    /**
     * UPDATE STATE
     */

    let complete = false;

    // if coordinates are winning
    if( gridCoordinatesAreWinning(x,y,this.grid,this.gridSize) )
    {
        this.winningPlayer = TicTacToeValuePlayerMap[value]
    }

    // if winningPlayer is set, or grid full (stalemate)
    if(
        this.winningPlayer != null
        ||
        gridFull(this.grid)
    )
    {
        complete = true
    }
     
    // if complete, update game and turn states
    if(complete)
    {
        this.turn = null
        this.state = TicTacToeGameState.COMPLETE
    }
    // update only turn state
    else
    {
        this.turn == TicTacToePlayer.ONE 
        ? 
        this.turn = TicTacToePlayer.TWO
        :
        this.turn = TicTacToePlayer.ONE  
    }
    
    /**
     * EMIT EVENTS
     */
    const turnExecutedArgs = {}
    this.emit(TicTacToeGameEvents.TURN_EXECUTED, turnExecutedArgs)
    
    if(complete)
    {
        const gameCompleteArgs = {}
        this.emit(TicTacToeGameEvents.GAME_COMPLETE, gameCompleteArgs)
    }

    return
  }
}

export enum TimedTicTacToeGameEvents {
    TIMER_EXPIRE = 'TIMER_EXPIRE'
}
export class TimedTicTacToeGame extends TicTacToeGame {
    timeout: NodeJS.Timeout | null = null
    turnDurationMs = 3000
    
    constructor(gridSize: GridSize){
        super(gridSize)
        // subscribe to game start even and launch timer
        this.on(TicTacToeGameEvents.START, ()=>this.resetTimeout())
        this.on(TicTacToeGameEvents.TURN_EXECUTED, ()=>this.resetTimeout())
    }

    clearTimeoutIfSet() : void 
    {
        if(this.timeout != null)
        {
            clearTimeout(this.timeout)
        }
    }

    resetTimeout() : void
    {
        this.clearTimeoutIfSet()
        this.timeout = setTimeout(()=>this.onTimeout(), this.turnDurationMs)
        return
    }

    onTimeout() : void
    {
        const timerExpireArgs = {}
        this.emit(TimedTicTacToeGameEvents.TIMER_EXPIRE, timerExpireArgs)
        return
    }
}