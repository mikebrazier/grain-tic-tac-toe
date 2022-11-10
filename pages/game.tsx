import ClientOnly from './../components/ClientOnly'
import {makeBrowserApolloClient} from './../src/makeBrowserApolloClient'
import { ApolloProvider } from "@apollo/client";
import { GET_GAMES, GET_USERS, GAMES_SUBSCRIPTION, USERS_SUBSCRIPTION} from './index'
import { useMutation, useQuery, useSubscription } from "@apollo/client";
import {  useState, useEffect } from 'react'
import { TicTacToeGameData } from './../src/GameManager'
import { Grid,CellValue } from './../src/Grid'
import { getCookie } from 'cookies-next';
import { gql } from "@apollo/client"

const EXECUTE_GAME_TURN = gql`mutation executeGameTurn($gameId: String, $playerId: String, $x: Int, $y: Int) {
    executeGameTurn(gameId: $gameId, playerId: $playerId, x: $x, y: $y) {
        game {
            gameData {
                grid
                gridSize
                state
                turn
                winningPlayer
            }
            id
            playerIds
        }
        games {
            gameData {
                grid
                gridSize
                state
                turn
                winningPlayer
            }
            id
            playerIds
        }
    }

}
`;

export function Game () {

    // API
    const [executeGameTurn] = useMutation(EXECUTE_GAME_TURN);
    const { data: getUsersAPIData } = useQuery(GET_USERS)
    const { data : newUsersSubData } = useSubscription(
        USERS_SUBSCRIPTION
      );
    const { data: getGamesAPIData } = useQuery(GET_GAMES)
    const { data : newGamesSubData } = useSubscription(GAMES_SUBSCRIPTION);

    // userId
    const [userIdFromCookie] = useState(getCookie('user_id'))

    // games
    const [games, setGames] = useState<TicTacToeGameData[]>([])
    useEffect(()=>{
        if(newGamesSubData?.newGames?.games)
        {
        setGames(newGamesSubData?.newGames?.games)
        }
        else if (
        getGamesAPIData?.getGames?.games
        )
        {
        setGames(getGamesAPIData?.getGames?.games)
        }
    },[
        getGamesAPIData,
        newGamesSubData
    ])

    // users
    const [users, setUsers] = useState<User[]>([])
    useEffect(
        ()=>{
        if(
            newUsersSubData?.newUsers?.users
        )
        {
            setUsers( newUsersSubData?.newUsers?.users )
        }
        else if(
            getUsersAPIData?.getUsers?.users
        )
        {
            setUsers( getUsersAPIData?.getUsers?.users )
        }
        },
        [
        getUsersAPIData,
        newUsersSubData
        ]
    )

     // user
    const [userFromId, _setUserFromId] = useState<User | null>(null)
    const setUserFromId = ()=> _setUserFromId( users.find( (u)=>u.id==userIdFromCookie ))
    useEffect(
        ()=>setUserFromId()
        ,
        [
        userIdFromCookie,
        users
        ]
    )

    // gameId
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id');
    
    // game
    const [game, setGame] = useState<TicTacToeGameData | null>(null)
    useEffect(()=>{
        const foundGame = games.find((g)=>g.id==gameId)
        if(gameId && foundGame)
        {
            setGame(foundGame)
        }
    },[
        games
    ])

    // selected coordinates
    const [ selectedCoords, setSelectedCoords ] = useState<(number|null)[]>([null, null])
    useEffect(()=>{
        if(game?.gameData.turn != getPlayerFromPlayerId())
        {
            setSelectedCoords([null, null])
        }

    }, [game?.gameData.turn])

    /**
     * Helper functions
     */

    const isSelected = (x,y) => (selectedCoords[0] == x && selectedCoords[1] == y)
    const canSelect = (x,y) => isPlayerTurn()&&(game?.gameData.grid[x][y] == CellValue.NULL)
    const coordsSelected = () => selectedCoords[0] != null && selectedCoords[1] != null
    const getPlayerFromPlayerId = ()=>{
        if(game?.playerIds[0] == userIdFromCookie)
        {
            return 1
        }
        else if (game?.playerIds[1] == userIdFromCookie)
        {
            return 2
        }
        return null
    }
    const isPlayerTurn = ()=> (getPlayerFromPlayerId() == game?.gameData.turn) && (game?.gameData.turn != null)

    const makeGridRows = (grid: Grid) =>
    {
        const rows : JSX.Element[] = [];
        for(let y = (grid.length - 1); y >= 0; --y )
        {
            const row = (
                <tr>
                {
                    grid.map((column, x)=>(
                        <td 
                        onClick={()=>{
                            if(canSelect(x,y))
                            {
                                setSelectedCoords([x,y])
                            }
                        }
                        }
                        style={{
                            width: '50px',
                            height: '50px',
                            background: isSelected(x,y) ? 'green' : 'grey',
                            textAlign: 'center',
                            fontSize: 'xxx-large',
                        }}
                        >
                            {
                                grid[x][y] == CellValue.NULL
                                ?
                                ''
                                :
                                (
                                    grid[x][y] == CellValue.X
                                    ?
                                    'x'
                                    :
                                    'o'
                                )

                            }
                        </td>
                        ))
                }
                </tr>
            )
            rows.push(row)
        }
        return rows
    }

    return(
        <div
        style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
          }}>
            <div>
                Username: { userFromId?.username } {getPlayerFromPlayerId() != null ? '(Player '+getPlayerFromPlayerId()+')' : ''}
            </div>
            <hr style={{width: '100%'}}></hr>
            {
                game && game.gameData.winningPlayer != null
                ?
                (
                    game.gameData.winningPlayer == getPlayerFromPlayerId()
                    ?
                    (<p style={{color: 'green'}}>WINNER</p>)
                    :
                    (<p style={{color: 'red'}}>LOSER</p>)
                )
                :
                ''
            }
            <table>
                {
                    game
                    ?
                    makeGridRows(game.gameData.grid)
                    :
                    'No Game'
                }
            </table>
            <hr style={{width: '100%'}}></hr>
            {
                // if there's a game, it's not complete and user is a player in game
                 game && game.gameData.state != 3 && getPlayerFromPlayerId() != null
                 ?
                 ( 
                    // if player's turn
                    isPlayerTurn()
                    ?
                    // expose controls
                    <button 
                    disabled={!(isPlayerTurn() && coordsSelected())}
                    onClick={
                        ()=>{
                            if( isPlayerTurn() && coordsSelected() )
                            {
                                executeGameTurn({variables:{
                                    gameId: game?.id, 
                                    playerId: userIdFromCookie,
                                    x: selectedCoords[0], 
                                    y: selectedCoords[1]
                                }})
                            }
                        }
                    }
                    >TAKE TURN</button>
                    :
                    // indicate awaiting controls
                    'AWAITING TURN'
                 )
                :
                ''
            }
            {
                // if game is over
                game && game.gameData.state == 3
                ?
                <div style={{marginTop: "10px"}}>
                    <a href={`/`}>
                        <button disabled={false}>HOME</button>
                    </a>
                </div>
                
                :
                ''
            }
        </div>
    )

}

export function GameWithApolloClient () {
    const client = makeBrowserApolloClient()
    return(
        <ApolloProvider client={client}>
        <Game></Game>
        </ApolloProvider>
    )
}

export default function ClientOnlyGame(){
    return(
        <ClientOnly>
            <GameWithApolloClient/>
        </ClientOnly>
    )
}