import { useState, useEffect } from 'react'
import { gql } from "@apollo/client"
import { getCookie } from 'cookies-next';
import { ApolloProvider } from "@apollo/client";
import { useMutation, useQuery, useSubscription } from "@apollo/client";
import { User } from '../src/UserManager'
import { TicTacToeGameData } from './../src/GameManager'
import ClientOnly from './../components/ClientOnly'
import {makeBrowserApolloClient} from './../src/makeBrowserApolloClient'

/**
 * GraphQL Queries
 */

export const GET_USERS =  gql`query getUsers {
  getUsers {
      users {
          id
          username
      }
  }
}`

export const GET_GAMES = gql`query getGames {
  getGames {
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
}`

// const SET_USERNAME = gql`mutation setUsername($id: String, $username: String){
//   setUsername(id: $id, username: $username) {
//       user {
//           id
//           username
//       }
//       users {
//           id
//           username
//       }
//   }
// }`

const CREATE_GAME = gql`mutation createGame($gridSize: Int, $playerOneId: String) {
  createGame(gridSize: $gridSize, playerOneId: $playerOneId) {
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
}`

const ADD_USER_TO_GAME = gql`mutation addUserToGame($gameId: String, $userId: String) {
  addUserToGame(gameId: $gameId, userId: $userId) {
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
}`

const START_GAME = gql`mutation startGame($gameId: String) {
  startGame(gameId: $gameId) {
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
}`

export const GAMES_SUBSCRIPTION = gql`subscription newGames {
    newGames {
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

export const USERS_SUBSCRIPTION = gql`subscription newUsers {
  newUsers {
    users {
        id
        username
    }
  }
}
`;

/**
 * HELPER FUNCTIONS
 */

const getUserById = (userId: string, users: User[])=>users.find((u)=>u.id==userId)
const userCanJoin = (userId: string, playerIds: string[]) =>(
  ! playerIds.includes(userId)
  &&
  playerIds.length < 2
)
const canStartGame = (game : TicTacToeGameData, userId: string ) => game.playerIds[0] == userId && game.playerIds.length == 2 && game.gameData.state == 1
const canGoToGame = (game : TicTacToeGameData, userId: string) => game.playerIds.includes(userId) && (game.gameData.state == 2 || game.gameData.state == 3)

/**
 * COMPONENTS
 */

export function GamesOrderedList ({games, userId, users, onAddUserToGame, onStartGame } : {games: TicTacToeGameData[], userId: string, users: User[], onAddUserToGame : (gameId : string, userId: string )=>void, onStartGame : (gameId: string) => void}){
  return(
    <table> 
      <tr>
        <th>Players</th>
        {/* <th>Winner</th> */}
        {/* <th>Loser</th> */}
        <th>Grid Size</th>
        <th>Join</th>
        <th>Start</th>
        <th>Go To</th>
      </tr>
      {
        [...games].filter((g)=>g.gameData.state != 3).map(
          (game)=>(
            <tr key={game.id}>
              {/* Players */}
              <td style={{ textAlign: 'center' }}>
                {
                  game.playerIds.length == 2
                  ?
                  getUserById(game.playerIds[0], users)?.username+' vs. '+getUserById(game.playerIds[1], users)?.username
                  :
                  getUserById(game.playerIds[0], users)?.username
                }
              </td>
              {/* WINNER */}
              {/* <td>
                {
                  game.gameData.winningPlayer == null
                  ?
                  ''
                  :
                  (
                    game.gameData.winningPlayer == 1
                    ?
                    getUserById(game.playerIds[0], users)?.username
                    :
                    getUserById(game.playerIds[1], users)?.username
                  ) 
                }
              </td> */}
              {/* LOSER */}
              {/* <td>
                {
                  game.gameData.winningPlayer == null
                  ?
                  ''
                  :
                  (
                    // if TicTacToePlayer.ONE == 1
                    game.gameData.winningPlayer == 1
                    ?
                    // TicTacToePlayer.TWO is loser (index 1 of playerIds)
                    getUserById(game.playerIds[1], users)?.username
                    :
                    getUserById(game.playerIds[0], users)?.username
                  ) 
                }
              </td> */}
              {/* Grid Size */}
              <td style={{ textAlign: 'center' }}>
                {
                  game.gameData.gridSize
                }
              </td>
              {/* Join */}
              <td>
                {
                  userCanJoin(userId, game.playerIds)
                  ? 
                  <button
                    onClick={
                      ()=>onAddUserToGame(game.id, userId)
                    }
                  >JOIN</button>
                  :
                  <button disabled>JOIN</button>
                }
              </td>
              {/* Start */}
              <td>
                <button 
                disabled={!canStartGame(game, userId)}
                onClick={
                  ()=>onStartGame(game.id)
                }
                >START</button>
              </td>
              {/* Go To */}
              <td>
                {
                  canGoToGame(game, userId)
                  ?
                  <a href={`/game?id=${game.id}`}>
                    <button disabled={false}>GO TO</button>
                  </a>
                  :
                  <button disabled={true}>GO TO</button>
                }
              </td>
            </tr>
          )
        )
      }
    </table>
  )
}

export function Index() {

  // API CALLS
  const { data: getUsersAPIData } = useQuery(GET_USERS)
  const { data: getGamesAPIData } = useQuery(GET_GAMES)
  // const [setUsernameAPI] = useMutation(SET_USERNAME);
  const [createGame] = useMutation(CREATE_GAME);
  const [addUserToGameAPI] = useMutation(ADD_USER_TO_GAME)
  const [startGameAPI] = useMutation(START_GAME)
  const { data : newGamesSubData } = useSubscription(
    GAMES_SUBSCRIPTION
  );
  const { data : newUsersSubData } = useSubscription(
    USERS_SUBSCRIPTION
  );

  /**
   * DYNAMIC DATA
   */
  // userId
  const [userIdFromCookie] = useState(getCookie('user_id'))
  
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

  // games
  const [games, setGames] = useState([])
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
  
  // username
  // const [ usernameFromInput, setUsernameFromInput ]  = useState('')

  // gridSize
  const[gridSize, setGridSize] = useState(3)

  return (
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
        Username: { userFromId?.username } 
      </div>
      <hr style={{width: '100%'}}/>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
        <GamesOrderedList 
          games={games} 
          userId={userIdFromCookie} 
          users={users}
          onAddUserToGame={
            (gameId, userId)=>addUserToGameAPI(
              {
                  variables: {
                    gameId: gameId,
                    userId: userId
                  }
                }
              )
          }
          onStartGame={
            (gameId)=>startGameAPI({variables: {
              gameId: gameId
            }})
          }
        />
        <hr style={{width: '100%'}}/>
        <div>
            <div style={{display: 'flex', flexDirection: 'row', alignContent: 'center', alignItems: 'center'}}>
              Grid Size:
              <select
                onChange={(e)=>{ setGridSize(parseInt(e.target.value)) }} 
                name="grid size" 
              >
                <option value={3}>3x3</option>
                <option value={4}>4x4</option>
                <option value={5}>5x5</option>
                <option value={6}>6x6</option>
              </select>
              <form
                onSubmit={e=>{
                  e.preventDefault()
                  createGame({variables:{
                    gridSize: gridSize,
                    playerOneId: getCookie('user_id')
                  }})
                }}
                style={{
                  marginLeft: '10px'
                }}
                >
                <button type="submit">Create Game</button>
            </form>
            </div>
        </div>
      </div>
          {/* <form
            onSubmit={e=>{
              e.preventDefault()
              if(usernameFromInput)
              {
                setUsernameAPI({variables: {
                  id: userIdFromCookie,
                  username: usernameFromInput
                }})
              }
            }}
          >
            <input
            onChange={(event)=>{
              setUsernameFromInput(event.target.value)
            }}
            // ref={}
            />
            <button type="submit">Set Username</button>
          </form> */}
    </div>
  )
}

export function IndexWithApolloClient(){
  const client = makeBrowserApolloClient()
  return(
    <ApolloProvider client={client}>
      <Index></Index>
    </ApolloProvider>
  )
}

export default function ClientOnlyIndex(){
  return(
    <ClientOnly>
      <IndexWithApolloClient/>
    </ClientOnly>
  )
}