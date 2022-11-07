import { gridSetCellValue, GridSize } from './Grid'
import {
    TicTacToeGame, TicTacToeGameState, TicTacToePlayer, TicTacToePlayerValueMap
} from './TicTacToe'

jest.mock('./Grid', () => {
    const originalModule = jest.requireActual('./Grid');
  
    //Mock the default export and named export 'foo'
    return {
      __esModule: true,
      ...originalModule,
      gridSetCellValue: jest.fn(),
    };
});

describe('TicTacToeGame.start()', () =>{
    let game = new TicTacToeGame(GridSize.THREE)
    
    beforeEach(() => {
        game = new TicTacToeGame(GridSize.THREE)
    });
    test(
        'starts game',
        ()=>{
            game = new TicTacToeGame(GridSize.THREE)
            expect(game.state).toBe(TicTacToeGameState.NOT_STARTED)
            expect(game.turn).toBe(null)
            game.start()
            expect(game.state).toBe(TicTacToeGameState.ONGOING)
            expect(game.turn).toBe(TicTacToePlayer.ONE)
        }
    )
    test(
        'emits start event',
        ()=>{
            game.emit = jest.fn()
            game.start()
            expect(game.emit).toBeCalled()
        }
    )
})

describe(
    'TicTacToeGame.onTurnExecuted()',
    ()=>{
        
        let game = new TicTacToeGame(GridSize.THREE)
        const player = TicTacToePlayer.ONE
    
        beforeEach(() => {
            game = new TicTacToeGame(GridSize.THREE)
            game.start()
        });

        test(
            'sets winning player, state, turn if coordinates are winning',
            ()=>{
                game.grid[0][0] = TicTacToePlayerValueMap[player]
                game.grid[1][1] = TicTacToePlayerValueMap[player]
                game.grid[2][2] = TicTacToePlayerValueMap[player]
                game.onTurnExecuted(2,2,TicTacToePlayerValueMap[player])
                expect(game.winningPlayer).toBe(player)
                expect(game.state).toBe(TicTacToeGameState.COMPLETE)
                expect(game.turn).toBe(null)
            }
        )

        test(
            'sets state, turn if grid is full',
            ()=>{
                game.grid[0]=[1,2,1]
                game.grid[1]=[2,1,2]
                game.grid[2]=[2,1,2]
                game.onTurnExecuted(2,2,TicTacToePlayerValueMap[player])
                expect(game.winningPlayer).toBe(null)
                expect(game.state).toBe(TicTacToeGameState.COMPLETE)
                expect(game.turn).toBe(null)
            }
        )

        test(
            'toggles player turn values',
            ()=>{
                game.start()
                game.onTurnExecuted(0,0,TicTacToePlayerValueMap[TicTacToePlayer.ONE])
                expect(game.turn).toBe(TicTacToePlayer.TWO)
                game.onTurnExecuted(1,1,TicTacToePlayerValueMap[TicTacToePlayer.TWO])
                expect(game.turn).toBe(TicTacToePlayer.ONE)
            }
        )

        test(
            'emits TURN_EXECUTED event',
            ()=>{
                game.start()

                game.emit = jest.fn()
                game.onTurnExecuted(0,0,TicTacToePlayerValueMap[TicTacToePlayer.ONE])
                expect(game.emit).toBeCalled()
            }
        )

        test(
            'emits GAME_COMPLETE event on complete',
            ()=>{
                game.start()
                game.grid[0][0] = TicTacToePlayerValueMap[player]
                game.grid[1][1] = TicTacToePlayerValueMap[player]
                game.grid[2][2] = TicTacToePlayerValueMap[player]

                game.emit = jest.fn()
                game.onTurnExecuted(2,2,TicTacToePlayerValueMap[player])
                expect(game.emit).toBeCalledTimes(2)
            }
        )
    }
)

describe(
    'TicTacToeGame.executeTurn()',
    ()=>{
        let game = new TicTacToeGame(GridSize.THREE)
        const player = TicTacToePlayer.ONE
    
        beforeEach(() => {
            game = new TicTacToeGame(GridSize.THREE)
        });

        test(
            'throws error when game not yet started',
            ()=>{
                const t = () => game.executeTurn(player,0,0)
                expect(t).toThrow(Error);
            }
        )

        test(
            'throws error when game complete',
            ()=>{
                game.state = TicTacToeGameState.COMPLETE
                const t = () => game.executeTurn(player,0,0)
                expect(t).toThrow(Error);
            }
        )

        test(
            'calls gridSetCellValue',
            ()=>{
                game.start()
                game.executeTurn(player,0,0)
                expect(gridSetCellValue).toBeCalled()
            }
        )

        test(
            'calls onTurnExecuted',
            ()=>{
                game.onTurnExecuted = jest.fn()
                game.start()
                game.executeTurn(player,0,0)
                expect(game.onTurnExecuted).toBeCalled()
            }
        )
    }
)

describe(
    'executePlayerTurn()',
    ()=>{
        let game = new TicTacToeGame(GridSize.THREE)
        const player = TicTacToePlayer.ONE
    
        beforeEach(() => {
            game = new TicTacToeGame(GridSize.THREE)
        });

        test(
            'throws error if not player turn',
            ()=>{
                // game hasn't been started, player turn is null
                const t = () => game.executePlayerTurn(player,0,0)
                expect(t).toThrow(Error);
                
                // turn is set to player two, not player one
                game.turn = TicTacToePlayer.TWO
                expect(t).toThrow(Error);
            }
        )

        test(
            'calls executeTurn()',
            ()=>{
                game.start()
                game.executeTurn = jest.fn()
                game.executePlayerTurn(player,0,0)
                expect(game.executeTurn).toBeCalled()
            }
        )
    }
)